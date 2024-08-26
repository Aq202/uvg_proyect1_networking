/**
 * Verifica si un texto dado es una URL válida.
 *
 * La función utiliza una expresión regular (regex) para verificar si el texto coincide con el
 * formato general de una URL.
 *
 * @param {string} text - El texto que se quiere verificar si es una URL.
 * @returns {boolean} - Devuelve `true` si el texto es una URL válida, de lo contrario `false`.
 */
const isUrl = (text) => {
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
    return regex.test(text);
}
export default isUrl;