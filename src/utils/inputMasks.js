function onlyNumbers(value, limit) {
  return value.replace(/\D/g, "").slice(0, limit);
}

export function formatCep(value) {
  return onlyNumbers(value, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

export function formatCnpj(value) {
  return onlyNumbers(value, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatPhone(value) {
  const numbers = onlyNumbers(value, 11);

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function applyMask(formatter) {
  return (event) => {
    event.currentTarget.value = formatter(event.currentTarget.value);
  };
}
