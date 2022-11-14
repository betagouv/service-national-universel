export const getAddress = async (text) => {
  const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${text}&autocomplete=1&type=municipality`, {
    mode: "cors",
    method: "GET",
  });
  const res = await response.json();
  return res;
};
