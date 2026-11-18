import { notifyToast, toast } from '@/services/toast-service';
// Hook centralizado para el formulario de 3 pasos de creación de canchas

import { useState, useCallback } from 'react';
import type {
  StepGeneralData,
  StepFeaturesData,
  StepLocationData,
  CourtFormDraft,
} from '@/types/courts';
import {
  validateStepGeneral,
  validateStepFeatures,
  validateStepLocation,
  hasErrors,
  type StepErrors,
} from '../validations';
import { getDraft, saveDraft, clearDraft } from '@/services/courts/court-draft-service';
import { saveCourt } from '@/services/courts/court-service';
import { DEFAULT_OPEN_TIME, DEFAULT_CLOSE_TIME } from '../constants';
import { courtFormSignature } from '../form-state';
import { normalizeCourtDays } from '@/lib/court-days';

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

const INITIAL_LOCATION: StepLocationData = {
  diasDisponibles: normalizeCourtDays(),
  venue: '',
  address: '',
  reference: '',
  horaInicio: DEFAULT_OPEN_TIME,
  horaFin: DEFAULT_CLOSE_TIME,
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
  return {
    ...data,
    diasDisponibles: normalizeCourtDays(data.diasDisponibles),
    horaInicio: data.horaInicio ?? '',
    horaFin: data.horaFin ?? '',
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
  canSave: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  hasChanges: boolean;
  errorMessage: string;
  setGeneral: (data: StepGeneralData) => void;
  setFeatures: (data: StepFeaturesData) => void;
  setLocation: (data: StepLocationData) => void;
  goNext: () => boolean;
  goBack: () => void;
  saveAsDraft: () => void;
  register: () => Promise<boolean>;
  resetForm: () => void;
  loadDraft: (draft: CourtFormDraft) => void;
}

export function useCourtForm(): UseCourtFormReturn {
  const [existing] = useState(getDraft);
  const [backendId, setBackendId] = useState(existing?.backendId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [draftId, setDraftId] = useState<string>(() => existing?.id ?? generateId());
  const [step, setStep] = useState(0);
  const [general, setGeneral] = useState<StepGeneralData>(normalizeGeneral(existing?.general));
  const [features, setFeatures] = useState<StepFeaturesData>(
    existing?.features ?? INITIAL_FEATURES
  );
  const [location, setLocation] = useState<StepLocationData>(normalizeLocation(existing?.location));
  const [originalSignature, setOriginalSignature] = useState(
    () =>
      existing?.originalSignature ??
      courtFormSignature(
        normalizeGeneral(existing?.general),
        existing?.features ?? INITIAL_FEATURES,
        normalizeLocation(existing?.location)
      )
  );
  const hasChanges = courtFormSignature(general, features, location) !== originalSignature;
  const isEditing = backendId !== undefined;

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
  const canSave =
    !isSubmitting &&
    (!isEditing || hasChanges) &&
    !hasErrors(validateStepGeneral(general)) &&
    !hasErrors(validateStepFeatures(features)) &&
    !hasErrors(validateStepLocation(location));

  // Persiste borrador automáticamente cuando cambia cada sección
  const persistDraft = useCallback(
    (g: StepGeneralData, f: StepFeaturesData, l: StepLocationData) => {
      saveDraft({ ...buildDraftFromState(draftId, g, f, l), backendId, originalSignature });
    },
    [draftId, backendId, originalSignature]
  );

  const handleSetGeneral = useCallback(
    (data: StepGeneralData) => {
      setSubmitStatus('idle');
      setErrorMessage('');
      setGeneral(data);
      setGeneralErrors(validateStepGeneral(data));
      persistDraft(data, features, location);
    },
    [features, location, persistDraft]
  );

  const handleSetFeatures = useCallback(
    (data: StepFeaturesData) => {
      setSubmitStatus('idle');
      setErrorMessage('');
      setFeatures(data);
      setFeaturesErrors(validateStepFeatures(data));
      persistDraft(general, data, location);
    },
    [general, location, persistDraft]
  );

  const handleSetLocation = useCallback(
    (data: StepLocationData) => {
      setSubmitStatus('idle');
      setErrorMessage('');
      setLocation(data);
      setLocationErrors(validateStepLocation(data));
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
    if (isSubmitting || !hasChanges) return;
    const draft = buildDraftFromState(draftId, general, features, location);
    saveDraft({ ...draft, backendId, originalSignature });
    setSubmitStatus('draft-saved');
    toast.success('Borrador guardado correctamente.');
  }, [
    draftId,
    general,
    features,
    location,
    backendId,
    originalSignature,
    isSubmitting,
    hasChanges,
  ]);

  const register = useCallback(async (): Promise<boolean> => {
    if (isSubmitting || (isEditing && !hasChanges)) return false;
    setErrorMessage('');
    const genErr = validateStepGeneral(general);
    const featErr = validateStepFeatures(features);
    const locErr = validateStepLocation(location);
    setGeneralErrors(genErr);
    setFeaturesErrors(featErr);
    setLocationErrors(locErr);
    if (hasErrors(genErr) || hasErrors(featErr) || hasErrors(locErr)) {
      setStep(hasErrors(genErr) ? 0 : hasErrors(featErr) ? 1 : 2);
      setSubmitStatus('error');
      toast.error('Revisa los campos marcados antes de guardar la cancha.');
      return false;
    }
    const draft = buildDraftFromState(draftId, general, features, location);
    setIsSubmitting(true);
    try {
      const saved = await saveCourt({ ...draft, backendId });
      setBackendId(saved.backendId);
      const savedGeneral = normalizeGeneral(saved.general);
      const savedLocation = normalizeLocation(saved.location);
      setGeneral(savedGeneral);
      setFeatures(saved.features);
      setLocation(savedLocation);
      setOriginalSignature(courtFormSignature(savedGeneral, saved.features, savedLocation));
      clearDraft();
      setSubmitStatus('registered');
      return true;
    } catch (err) {
      setErrorMessage(
        notifyToast(err instanceof Error ? err.message : 'No se pudo guardar la cancha.', 'error')
      );
      setSubmitStatus('error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [draftId, general, features, location, backendId, isSubmitting, isEditing, hasChanges]);

  const resetForm = useCallback(() => {
    setOriginalSignature(courtFormSignature(INITIAL_GENERAL, INITIAL_FEATURES, INITIAL_LOCATION));
    setBackendId(undefined);
    setErrorMessage('');
    setDraftId(generateId());
    setStep(0);
    setGeneral(INITIAL_GENERAL);
    setFeatures(INITIAL_FEATURES);
    setLocation(INITIAL_LOCATION);
    setGeneralErrors({});
    setFeaturesErrors({});
    setLocationErrors({});
    setSubmitStatus('idle');
    clearDraft();
  }, []);

  const loadDraft = useCallback((draft: CourtFormDraft) => {
    setOriginalSignature(
      draft.originalSignature ??
        courtFormSignature(
          normalizeGeneral(draft.general),
          draft.features,
          normalizeLocation(draft.location)
        )
    );
    setBackendId(draft.backendId);
    setErrorMessage('');
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
    canSave,
    isSubmitting,
    isEditing,
    hasChanges,
    errorMessage,
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
