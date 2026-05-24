import type { BirthdayData } from '../types';

function capitalize(str: string): string {
  const words = str.split(' ');
  words[2] = words[2].charAt(0).toUpperCase() + words[2].slice(1);
  return words.join(' ');
}

function formatTimeUntilBirthday(birthday: Date): string {
  const now = new Date();
  const birthDate = new Date(birthday);

  const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  if (
    now > nextBirthday &&
    !(now.getDate() === birthDate.getDate() && now.getMonth() === birthDate.getMonth())
  ) {
    nextBirthday.setFullYear(now.getFullYear() + 1);
  }

  if (
    now.getDate() === nextBirthday.getDate() &&
    now.getMonth() === nextBirthday.getMonth()
  ) {
    return 'hoje';
  }

  let months = nextBirthday.getMonth() - now.getMonth();
  let days = nextBirthday.getDate() - now.getDate();

  if (months < 0 || (months === 0 && days < 0)) {
    months += 12;
  }

  if (days < 0) {
    const prevMonth = new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), 0).getDate();
    days += prevMonth;
    months = (months - 1 + 12) % 12;
  }

  const parts: string[] = [];
  if (months > 0) parts.push(`${months} ${months > 1 ? 'meses' : 'mês'}`);
  if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);

  return parts.length > 0 ? parts.join(' e ') : 'em breve';
}

export function formatBirthdayMessage(birthdayData: BirthdayData): { message: string; isToday: boolean } {
  const formattedDate = capitalize(birthdayData.birthdate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  }));

  const time = formatTimeUntilBirthday(birthdayData.birthdate);

  if (time === 'hoje') {
    if (birthdayData.show_age) {
      return {
        message: `De acordo com a minha memória, hoje é seu aniversário e você está completando ${birthdayData.age} anos! Parabéns! 🎉`,
        isToday: true,
      };
    }
    return {
      message: 'De acordo com a minha memória, hoje é seu aniversário! Parabéns! 🎉',
      isToday: true,
    };
  }

  let message = `De acordo com a minha memória, seu aniversário é em ${time}, no dia ${formattedDate}`;
  if (birthdayData.show_age) {
    message += `, e você estará completando ${(birthdayData.age ?? 0) + 1} anos`;
  }
  message += '! Tá logo aí! 🎉';

  return {
    message,
    isToday: false,
  };
}

export function formatBirthdayLine(userBirthday: BirthdayData): string {
  const birthDateObj = new Date(userBirthday.birthdate);
  const date = capitalize(birthDateObj.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  }));
  const inText = formatTimeUntilBirthday(userBirthday.birthdate);

  if (userBirthday.show_age) {
    return `🎂 <@${userBirthday.user_id}> - ${date} (${inText}) — fará ${(userBirthday.age ?? 0) + 1} anos`;
  }
  return `🎉 <@${userBirthday.user_id}> - ${date} (${inText})`;
}
