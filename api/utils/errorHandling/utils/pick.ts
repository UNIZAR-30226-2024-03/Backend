// Función que recibe un objeto y un array de strings, y devuelve un objeto con las
// propiedades que coinciden con los strings del array.
const pick = (obj: object, keys: string[]) => {
    return keys.reduce<{ [key: string]: unknown }>((finalObj, key) => {
      if (obj && Object.hasOwnProperty.call(obj, key)) {
        finalObj[key] = obj[key as keyof typeof obj];
      }
      return finalObj;
    }, {});
  };
  
  export default pick;