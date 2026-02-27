export const validEmbargo = (item) => {
  return !!item["embargo_start_date"] || !!item["embargo_end_date"];
};

export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};
