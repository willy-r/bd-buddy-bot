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

function timeUntilBirthday(birthday) {
  const now = new Date();
  const parsedBirthday = new Date(birthday);
  const birthdayDate = new Date(now.getFullYear(), parsedBirthday.getMonth(), parsedBirthday.getDate());

  // Check if the birthday has already occurred this year.
  if (now.getMonth() > birthdayDate.getMonth() ||
    (now.getMonth() === birthdayDate.getMonth() && now.getDate() > birthdayDate.getDate())) {
    // If so, set the next birthday to next year.
    birthdayDate.setFullYear(now.getFullYear() + 1);
  }

  const timeDiff = birthdayDate.getTime() - now.getTime();

  const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let result = '';
  if (months > 0) {
    result += `${months} month${months > 1 ? 's' : ''}, `;
  }
  if (days > 0) {
    result += `${days} day${days > 1 ? 's' : ''}, `;
  }
  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  // Trim any trailing comma and space.
  result = result.replace(/,\s*$/, '');

  return result;
}

module.exports = {
  isDateInFuture,
  parseDateStringToDate,
  timeUntilBirthday,
};
