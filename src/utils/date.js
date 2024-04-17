function isDateInFuture(date) {
  const now = new Date();
  return date > now;
}

function parseDateStringToDate(dateString) {
  const parts = dateString.split('/');
  const year = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[0], 10);
  return new Date(year, month, day);
}

module.exports = {
  isDateInFuture,
  parseDateStringToDate,
};
