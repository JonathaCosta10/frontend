/**
 * Funções utilitárias para validação de formulários
 * Centraliza lógica de validação para manter consistência em toda a aplicação
 */

// Regex comum para validações
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(?([0-9]{2})\)?\s?([0-9]{4,5})-?([0-9]{4})$/,
  cpf: /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2})$/,
  cnpj: /^([0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}-?[0-9]{2})$/,
  cep: /^([0-9]{5}-?[0-9]{3})$/,
  date: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/([0-9]{4})$/,
  money: /^R\$\s?([0-9]{1,3}(\.?[0-9]{3})*(,[0-9]{2})?)$/,
  number: /^-?[0-9]+([,.][0-9]+)?$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Funções de validação básicas

/**
 * Verifica se um campo está preenchido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o campo está preenchido, falso caso contrário
 */
export const required = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  return true;
};

/**
 * Verifica se um valor é um email válido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o email é válido, falso caso contrário
 */
export const isEmail = (value: string): boolean => {
  if (!value) return true; // Permite vazio (use em conjunto com required se o campo for obrigatório)
  return patterns.email.test(value);
};

/**
 * Verifica se um valor é um número válido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se é um número válido, falso caso contrário
 */
export const isNumber = (value: string): boolean => {
  if (!value) return true;
  return patterns.number.test(value);
};

/**
 * Verifica se um valor é um telefone válido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o telefone é válido, falso caso contrário
 */
export const isPhone = (value: string): boolean => {
  if (!value) return true;
  return patterns.phone.test(value);
};

/**
 * Verifica se um valor é um CPF válido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o CPF é válido, falso caso contrário
 */
export const isCPF = (value: string): boolean => {
  if (!value) return true;
  
  // Remove caracteres não numéricos
  const cpf = value.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf.charAt(9)) !== dv1) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(cpf.charAt(10)) === dv2;
};

/**
 * Verifica se um valor é um CNPJ válido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o CNPJ é válido, falso caso contrário
 */
export const isCNPJ = (value: string): boolean => {
  if (!value) return true;
  
  // Remove caracteres não numéricos
  const cnpj = value.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação dos dígitos verificadores
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  
  return resultado === parseInt(digitos.charAt(1));
};

/**
 * Verifica se um valor é um CEP válido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o CEP é válido, falso caso contrário
 */
export const isCEP = (value: string): boolean => {
  if (!value) return true;
  return patterns.cep.test(value);
};

/**
 * Verifica se um valor é uma data válida no formato DD/MM/YYYY
 * @param value Valor a ser verificado
 * @returns Verdadeiro se a data é válida, falso caso contrário
 */
export const isDate = (value: string): boolean => {
  if (!value) return true;
  
  if (!patterns.date.test(value)) return false;
  
  const parts = value.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  // Verifica mês válido
  if (month < 1 || month > 12) return false;
  
  // Verifica dia válido para o mês
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;
  
  return true;
};

/**
 * Verifica se um valor é um valor monetário válido
 * @param value Valor a ser verificado
 * @returns Verdadeiro se o valor monetário é válido, falso caso contrário
 */
export const isMoney = (value: string): boolean => {
  if (!value) return true;
  return patterns.money.test(value) || patterns.number.test(value);
};

/**
 * Verifica se um valor tem o comprimento mínimo
 * @param value Valor a ser verificado
 * @param min Comprimento mínimo
 * @returns Verdadeiro se o valor tem o comprimento mínimo, falso caso contrário
 */
export const minLength = (value: string, min: number): boolean => {
  if (!value) return true;
  return value.length >= min;
};

/**
 * Verifica se um valor tem o comprimento máximo
 * @param value Valor a ser verificado
 * @param max Comprimento máximo
 * @returns Verdadeiro se o valor tem o comprimento máximo, falso caso contrário
 */
export const maxLength = (value: string, max: number): boolean => {
  if (!value) return true;
  return value.length <= max;
};

/**
 * Verifica se um valor é maior ou igual a um mínimo
 * @param value Valor a ser verificado
 * @param min Valor mínimo
 * @returns Verdadeiro se o valor é maior ou igual ao mínimo, falso caso contrário
 */
export const min = (value: number, min: number): boolean => {
  if (value === null || value === undefined) return true;
  return value >= min;
};

/**
 * Verifica se um valor é menor ou igual a um máximo
 * @param value Valor a ser verificado
 * @param max Valor máximo
 * @returns Verdadeiro se o valor é menor ou igual ao máximo, falso caso contrário
 */
export const max = (value: number, max: number): boolean => {
  if (value === null || value === undefined) return true;
  return value <= max;
};

/**
 * Verifica se um valor está entre um mínimo e um máximo (inclusive)
 * @param value Valor a ser verificado
 * @param min Valor mínimo
 * @param max Valor máximo
 * @returns Verdadeiro se o valor está entre o mínimo e o máximo, falso caso contrário
 */
export const between = (value: number, min: number, max: number): boolean => {
  if (value === null || value === undefined) return true;
  return value >= min && value <= max;
};

/**
 * Verifica se uma senha atende aos requisitos de segurança
 * - Pelo menos 8 caracteres
 * - Pelo menos uma letra minúscula
 * - Pelo menos uma letra maiúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 * @param value Valor a ser verificado
 * @returns Verdadeiro se a senha é forte, falso caso contrário
 */
export const isStrongPassword = (value: string): boolean => {
  if (!value) return true;
  return patterns.password.test(value);
};

/**
 * Verifica se duas senhas são iguais
 * @param password Senha
 * @param confirmPassword Confirmação de senha
 * @returns Verdadeiro se as senhas são iguais, falso caso contrário
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  if (!password || !confirmPassword) return true;
  return password === confirmPassword;
};

// Mensagens de erro padrão
export const errorMessages = {
  required: 'Este campo é obrigatório',
  email: 'Email inválido',
  phone: 'Telefone inválido',
  cpf: 'CPF inválido',
  cnpj: 'CNPJ inválido',
  cep: 'CEP inválido',
  date: 'Data inválida',
  money: 'Valor monetário inválido',
  number: 'Número inválido',
  minLength: (min: number) => `Mínimo de ${min} caracteres`,
  maxLength: (max: number) => `Máximo de ${max} caracteres`,
  min: (min: number) => `Valor mínimo de ${min}`,
  max: (max: number) => `Valor máximo de ${max}`,
  between: (min: number, max: number) => `Valor deve estar entre ${min} e ${max}`,
  password: 'Senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais',
  passwordsMatch: 'As senhas não conferem',
};

// Funções compostas de validação

/**
 * Validação padrão para o campo Nome
 * @param value Valor a ser validado
 * @returns Objeto com resultado da validação e mensagem de erro se houver
 */
export const validateName = (value: string) => {
  if (!required(value)) {
    return { isValid: false, message: errorMessages.required };
  }
  
  if (!minLength(value, 3)) {
    return { isValid: false, message: errorMessages.minLength(3) };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validação padrão para o campo Email
 * @param value Valor a ser validado
 * @returns Objeto com resultado da validação e mensagem de erro se houver
 */
export const validateEmail = (value: string) => {
  if (!required(value)) {
    return { isValid: false, message: errorMessages.required };
  }
  
  if (!isEmail(value)) {
    return { isValid: false, message: errorMessages.email };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validação padrão para o campo Senha
 * @param value Valor a ser validado
 * @returns Objeto com resultado da validação e mensagem de erro se houver
 */
export const validatePassword = (value: string) => {
  if (!required(value)) {
    return { isValid: false, message: errorMessages.required };
  }
  
  if (!isStrongPassword(value)) {
    return { isValid: false, message: errorMessages.password };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validação padrão para o campo CPF
 * @param value Valor a ser validado
 * @returns Objeto com resultado da validação e mensagem de erro se houver
 */
export const validateCPF = (value: string) => {
  if (!required(value)) {
    return { isValid: false, message: errorMessages.required };
  }
  
  if (!isCPF(value)) {
    return { isValid: false, message: errorMessages.cpf };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validação padrão para o campo Valor Monetário
 * @param value Valor a ser validado
 * @param min Valor mínimo opcional
 * @returns Objeto com resultado da validação e mensagem de erro se houver
 */
export const validateMoney = (value: string, minValue?: number) => {
  if (!required(value)) {
    return { isValid: false, message: errorMessages.required };
  }
  
  if (!isMoney(value)) {
    return { isValid: false, message: errorMessages.money };
  }
  
  if (minValue !== undefined) {
    const numValue = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (numValue < minValue) {
      return { isValid: false, message: errorMessages.min(minValue) };
    }
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validação padrão para o campo Data
 * @param value Valor a ser validado
 * @returns Objeto com resultado da validação e mensagem de erro se houver
 */
export const validateDate = (value: string) => {
  if (!required(value)) {
    return { isValid: false, message: errorMessages.required };
  }
  
  if (!isDate(value)) {
    return { isValid: false, message: errorMessages.date };
  }
  
  return { isValid: true, message: '' };
};
