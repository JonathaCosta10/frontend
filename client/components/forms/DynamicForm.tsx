import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/contexts/TranslationContext';
import { Plus, RotateCcw } from 'lucide-react';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
  min?: number;
  max?: number;
  step?: number;
  rows?: number; // For textarea
}

export interface DynamicFormProps {
  fields: FormFieldConfig[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  clearLabel?: string;
  loading?: boolean;
  initialValues?: Record<string, any>;
  showClearButton?: boolean;
  showRepeatButton?: boolean;
  onRepeat?: () => void;
  repeatLabel?: string;
  className?: string;
  gridCols?: 1 | 2 | 3;
}

/**
 * Componente genérico de formulário que elimina duplicação de código
 * Usado em Entradas, Custos, Dividas, Metas, etc.
 */
export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  submitLabel,
  clearLabel,
  loading = false,
  initialValues = {},
  showClearButton = true,
  showRepeatButton = false,
  onRepeat,
  repeatLabel,
  className = '',
  gridCols = 2,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.name] = t('field_required') || `${field.label} é obrigatório`;
        return;
      }

      // Custom validation
      if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }

      // Number validation
      if (field.type === 'number' && value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          newErrors[field.name] = t('invalid_number') || 'Número inválido';
          return;
        }
        if (field.min !== undefined && numValue < field.min) {
          newErrors[field.name] = t('min_value_error') || `Valor mínimo: ${field.min}`;
          return;
        }
        if (field.max !== undefined && numValue > field.max) {
          newErrors[field.name] = t('max_value_error') || `Valor máximo: ${field.max}`;
          return;
        }
      }

      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = t('invalid_email') || 'Email inválido';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleClear = () => {
    setFormData(initialValues);
    setErrors({});
  };

  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    const commonProps = {
      id: field.name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleInputChange(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
    };

    let fieldElement: React.ReactNode;

    switch (field.type) {
      case 'select':
        fieldElement = (
          <Select
            value={value}
            onValueChange={(newValue) => handleInputChange(field.name, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;

      case 'textarea':
        fieldElement = (
          <Textarea
            {...commonProps}
            rows={field.rows || 3}
          />
        );
        break;

      case 'number':
        fieldElement = (
          <Input
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step || 'any'}
          />
        );
        break;

      default:
        fieldElement = (
          <Input
            {...commonProps}
            type={field.type}
          />
        );
    }

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {fieldElement}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  };

  const gridClass = `grid grid-cols-1 ${
    gridCols === 2 ? 'md:grid-cols-2' : gridCols === 3 ? 'md:grid-cols-3' : ''
  } gap-4`;

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className={gridClass}>
        {fields.map(renderField)}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {loading ? t('loading') || 'Carregando...' : (submitLabel || t('submit') || 'Enviar')}
        </Button>

        {showClearButton && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={loading}
          >
            {clearLabel || t('clear') || 'Limpar'}
          </Button>
        )}

        {showRepeatButton && onRepeat && (
          <Button
            type="button"
            variant="outline"
            onClick={onRepeat}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{repeatLabel || t('repeat_last_value') || 'Repetir último valor'}</span>
          </Button>
        )}
      </div>
    </form>
  );
};

export default DynamicForm;
