import type { BirthdayData } from '../types';

type MessageFn = (userBirthday: BirthdayData) => string;

const birthdayMessages: MessageFn[] = [
  (userBirthday) => `🎉 Feliz aniversário, <@${userBirthday.user_id}>! Que o seu dia seja incrível! 🎂`,
  (userBirthday) => `🎈 Hoje é dia de festa! Parabéns, <@${userBirthday.user_id}>! 🥳`,
  (userBirthday) => `🎂 Uhuu! Chegou o grande dia, <@${userBirthday.user_id}>! Feliz aniversário! 🎉`,
  (userBirthday) => `✨ Muita saúde, alegria e sucesso pra você, <@${userBirthday.user_id}>! Feliz aniversário! 🎁`,
  (userBirthday) => `🥳 Parabéns pelo seu dia, <@${userBirthday.user_id}>! Aproveite muito! 🎉`,
];

const birthdayMessagesWithAge: MessageFn[] = [
  (userBirthday) => `🎉 Feliz aniversário pelos seus ${(userBirthday.age ?? 0) + 1} anos, <@${userBirthday.user_id}>! 🎂`,
  (userBirthday) => `🎂 Hoje você completa ${(userBirthday.age ?? 0) + 1} anos! Parabéns, <@${userBirthday.user_id}>! 🎈`,
  (userBirthday) => `🎁 Mais um ano de vida! Feliz ${(userBirthday.age ?? 0) + 1} anos, <@${userBirthday.user_id}>! 🥳`,
  (userBirthday) => `🎊 Parabéns pelos seus ${(userBirthday.age ?? 0) + 1} anos, <@${userBirthday.user_id}>! Que venham muitos outros! ✨`,
];

const birthdayGifs: string[] = [
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmVtdGxxczJ3d3B3cjNnN2QzbmRhZHRydnRiZXh3d3g5eXlrd3FpdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/T1mwiKjGsITzaWMGu4/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHUweWIxbzEyZms5cTRxZ3h3bmU0cmZuYXF1Zmw3cm5oZ3pkM2l4bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Im6d35ebkCIiGzonjI/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTgwN2xpdXV3dnpla3Bwd3hxMjlrMng1NzN4bmpnYmxrejE1Mm81NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4R9iPofhP6lQzmTlhA/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2lkem4xajgyeHNtcTAxb2NzMGZieHE0MGh2Nmtxam55ZXhxbTRhYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4KhS0BOFBhU2SYIU/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjQzanVpYzhsZWNpMGVkeWRrZ3czdXJ2MW9paWRrMHh6ajZtOW4yOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1Y9mflWqoSy13wAfQR/giphy.gif',
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExenB2Y2V4aXNwbXZhZnU4cWtkN3VoMW52emR2eHJjYmtybjl3a3A4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RcAqjtrbxJCqIzQZ6h/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnMxMWU2MG9obms2cW9uODl5bDFwdTU1aHJtbjYxdWloMXFvYnk3MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6gbbokTpXfxyda00/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzUyd2xqcmNsbm5xaWxzazdzaDRkcmE3cW02NmNtMjVvNHI1YzQxciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/x5q7AhlgOhRgP7lzhc/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGhqcWJveml2MzFsbm9vd2NoZGJidmxvejNpdTNvaGRmamh4bmkwbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9fEE6IkH7Ddz12WcHJ/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjZ0NGdxenE1eGY3cTg4NThtczNtaTZuMnplaDl4a25ncDdkNGF6bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Q7cfgKXdehjTluvop4/giphy.gif',
  'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXZ5ajB5Nzg3MXV2bmpsY2N6dW5ncDJxMG54eW1idXc4ZWo0ZzNzeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eRXQ9JRiOHSNwVoGxt/giphy.gif',
];

export function getRandomBirthdayMessage(userBirthday: BirthdayData): string {
  const messages = userBirthday.show_age ? birthdayMessagesWithAge : birthdayMessages;
  const index = Math.floor(Math.random() * messages.length);
  return messages[index](userBirthday);
}

export function getRandomBirthdayGif(): string {
  const index = Math.floor(Math.random() * birthdayGifs.length);
  return birthdayGifs[index];
}
