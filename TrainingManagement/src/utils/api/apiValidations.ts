export class Validator {
  // Método para validar si el UUID es válido
  public static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Método para validar cédula ecuatoriana
  public static isValidCedula(cedula: string): boolean {
    const cedulaRegex = /^[0-9]{10}$/; // La cédula debe ser un número de 10 dígitos
    if (!cedulaRegex.test(cedula)) return false;

    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false; // Las provincias válidas están entre 01 y 24

    const digitos = cedula.split('').map(Number);
    const suma = digitos.slice(0, 9).reduce((acc, digit, index) => {
      const factor = index % 2 === 0 ? 1 : 2;
      const resultado = digit * factor;
      return acc + (resultado > 9 ? resultado - 9 : resultado);
    }, 0);

    const decenaSuperior = Math.ceil(suma / 10) * 10;
    const digitoVerificador = decenaSuperior - suma;

    return digitoVerificador === digitos[9];
  }

  // Método para validar pasaporte (ejemplo básico)
  public static isValidPasaporte(pasaporte: string): boolean {
    const pasaporteRegex = /^[A-Z]{1,2}[0-9]{6}$/; // Formato común para pasaportes (1 o 2 letras seguidas de 6 números)
    return pasaporteRegex.test(pasaporte);
  }

  // Método para validar si un número es válido
  public static isValidNumber(value: string): boolean {
    const numberRegex = /^\d+$/; // Solo dígitos
    return numberRegex.test(value);
  }
  // Otros métodos...

  // Método para verificar si una cadena está completamente en mayúsculas
  public static isUpperCase(value: string): boolean {
    if (typeof value !== 'string' || !value) {
      return false;
    }
    return value === value.toUpperCase();
  }
}
