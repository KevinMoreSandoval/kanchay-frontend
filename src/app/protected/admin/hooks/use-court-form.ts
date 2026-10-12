// Hook centralizado para el formulario de 3 pasos de creación de canchas

import { useState, useCallback } from 'react';
import type {
  StepGeneralData,
  StepFeaturesData,
  StepLocationData,
  CourtFormDraft,
} from '../courts/types';
import {
  validateStepGeneral,
  validateStepFeatures,
  validateStepLocation,
  hasErrors,
  type StepErrors,
} from '../courts/validations';
import { getDraft, saveDraft, clearDraft, saveManagedCourt } from '@/services/court-draft-service';
import { WEEK_DAYS, DEFAULT_OPEN_TIME, DEFAULT_CLOSE_TIME } from '../courts/constants';

// ─── Valores iniciales ────────────────────────────────────────────────────────

const INITIAL_GENERAL: StepGeneralData = {
  name: '',
  sport: '',
  modality: '',
  surface: '',
  description: '',
  photos: [],
};

const INITIAL_FEATURES: StepFeaturesData = {
  capacity: '',
  width: '',
  length: '',
  coverType: '',
  lighting: '',
  services: [],
  amenities: [],
  pricePerHour: '',
  promotionalPrice: '',
};

const buildInitialSchedule = () =>
  WEEK_DAYS.map((day) => ({
    id: `schedule-${day.toLowerCase()}`,
    day,
    opens: DEFAULT_OPEN_TIME,
    closes: DEFAULT_CLOSE_TIME,
    isOpen: true,
  }));

const INITIAL_LOCATION: StepLocationData = {
  venue: '',
  address: '',
  reference: '',
  schedule: buildInitialSchedule(),
  status: 'activa',
};

function generateId(): string {
  return `court-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generatePhotoId(): string {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeGeneral(data?: StepGeneralData): StepGeneralData {
  if (!data) return INITIAL_GENERAL;

  return {
    ...data,
    photos: data.photos.map((photo) => {
      if (typeof photo === 'string') {
        return { id: generatePhotoId(), src: photo };
      }

      return {
        ...photo,
        id: photo.id || generatePhotoId(),
      };
    }),
  };
}

function normalizeLocation(data?: StepLocationData): StepLocationData {
  if (!data) return INITIAL_LOCATION;
  const savedSchedule = Array.isArray(data.schedule) ? data.schedule : [];

  return {
    ...data,
    schedule: WEEK_DAYS.map((day) => {
      const entry = savedSchedule.find((item) => item.day === day);
      return {
        id: `schedule-${day.toLowerCase()}`,
        day,
        opens: entry?.opens || DEFAULT_OPEN_TIME,
        closes: entry?.closes || DEFAULT_CLOSE_TIME,
        isOpen: entry?.isOpen ?? true,
      };
    }),
  };
}

function buildDraftFromState(
  id: string,
  general: StepGeneralData,
  features: StepFeaturesData,
  location: StepLocationData
): CourtFormDraft {
  return { id, general, features, location, savedAt: new Date().toISOString() };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseCourtFormReturn {
  step: number;
  draftId: string;
  general: StepGeneralData;
  features: StepFeaturesData;
  location: StepLocationData;
  generalErrors: StepErrors<StepGeneralData>;
  featuresErrors: StepErrors<StepFeaturesData>;
  locationErrors: StepErrors<StepLocationData>;
  submitStatus: 'idle' | 'draft-saved' | 'registered' | 'error';
  canAdvance: boolean;
  setGeneral: (data: StepGeneralData) => void;
  setFeatures: (data: StepFeaturesData) => void;
  setLocation: (data: StepLocationData) => void;
  goNext: () => boolean;
  goBack: () => void;
  saveAsDraft: () => void;
  register: () => boolean;
  resetForm: () => void;
  loadDraft: (draft: CourtFormDraft) => void;
}

export function useCourtForm(): UseCourtFormReturn {
  const existing = getDraft();

  const [draftId, setDraftId] = useState<string>(() => existing?.id ?? generateId());
  const [step, setStep] = useState(0);
  const [general, setGeneral] = useState<StepGeneralData>(normalizeGeneral(existing?.general));
  const [features, setFeatures] = useState<StepFeaturesData>(
    existing?.features ?? INITIAL_FEATURES
  );
  const [location, setLocation] = useState<StepLocationData>(normalizeLocation(existing?.location));

  const [generalErrors, setGeneralErrors] = useState<StepErrors<StepGeneralData>>({});
  const [featuresErrors, setFeaturesErrors] = useState<StepErrors<StepFeaturesData>>({});
  const [locationErrors, setLocationErrors] = useState<StepErrors<StepLocationData>>({});

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'draft-saved' | 'registered' | 'error'>(
    'idle'
  );

  const canAdvance =
    step === 0
      ? !hasErrors(validateStepGeneral(general))
      : step === 1
        ? !hasErrors(validateStepFeatures(features))
        : !hasErrors(validateStepLocation(location));

  // Persiste borrador automáticamente cuando cambia cada sección
  const persistDraft = useCallback(
    (g: StepGeneralData, f: StepFeaturesData, l: StepLocationData) => {
      saveDraft(buildDraftFromState(draftId, g, f, l));
    },
    [draftId]
  );

  const handleSetGeneral = useCallback(
    (data: StepGeneralData) => {
      setGeneral(data);
      persistDraft(data, features, location);
    },
    [features, location, persistDraft]
  );

  const handleSetFeatures = useCallback(
    (data: StepFeaturesData) => {
      setFeatures(data);
      persistDraft(general, data, location);
    },
    [general, location, persistDraft]
  );

  const handleSetLocation = useCallback(
    (data: StepLocationData) => {
      setLocation(data);
      persistDraft(general, features, data);
    },
    [general, features, persistDraft]
  );

  // Validar el step actual y avanzar si es válido
  const goNext = useCallback((): boolean => {
    if (step === 0) {
      const errors = validateStepGeneral(general);
      setGeneralErrors(errors);
      if (hasErrors(errors)) return false;
    }
    if (step === 1) {
      const errors = validateStepFeatures(features);
      setFeaturesErrors(errors);
      if (hasErrors(errors)) return false;
    }
    if (step === 2) {
      const errors = validateStepLocation(location);
      setLocationErrors(errors);
      if (hasErrors(errors)) return false;
    }
    setStep((s) => Math.min(s + 1, 2));
    return true;
  }, [step, general, features, location]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const saveAsDraft = useCallback(() => {
    const draft = buildDraftFromState(draftId, general, features, {
      ...location,
      status: 'borrador',
    });
    saveDraft(draft);
    setSubmitStatus('draft-saved');
  }, [draftId, general, features, location]);

  const register = useCallback((): boolean => {
    const genErr = validateStepGeneral(general);
    const featErr = validateStepFeatures(features);
    const locErr = validateStepLocation(location);
    setGeneralErrors(genErr);
    setFeaturesErrors(featErr);
    setLocationErrors(locErr);
    if (hasErrors(genErr) || hasErrors(featErr) || hasErrors(locErr)) {
      setSubmitStatus('error');
      return false;
    }
    const draft = buildDraftFromState(draftId, general, features, location);
    saveManagedCourt(draft);
    clearDraft();
    setSubmitStatus('registered');
    return true;
  }, [draftId, general, features, location]);

  const resetForm = useCallback(() => {
    setDraftId(generateId());
    setStep(0);
    setGeneral(INITIAL_GENERAL);
    setFeatures(INITIAL_FEATURES);
    setLocation({ ...INITIAL_LOCATION, schedule: buildInitialSchedule() });
    setGeneralErrors({});
    setFeaturesErrors({});
    setLocationErrors({});
    setSubmitStatus('idle');
    clearDraft();
  }, []);

  const loadDraft = useCallback((draft: CourtFormDraft) => {
    setDraftId(draft.id);
    setStep(0);
    setGeneral(normalizeGeneral(draft.general));
    setFeatures(draft.features);
    setLocation(normalizeLocation(draft.location));
    setGeneralErrors({});
    setFeaturesErrors({});
    setLocationErrors({});
    setSubmitStatus('idle');
    saveDraft(draft);
  }, []);

  return {
    step,
    draftId,
    general,
    features,
    location,
    generalErrors,
    featuresErrors,
    locationErrors,
    submitStatus,
    canAdvance,
    setGeneral: handleSetGeneral,
    setFeatures: handleSetFeatures,
    setLocation: handleSetLocation,
    goNext,
    goBack,
    saveAsDraft,
    register,
    resetForm,
    loadDraft,
  };
}
