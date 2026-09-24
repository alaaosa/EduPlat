import { NotificationType } from 'src/notification/constants/notification.constants';

interface IEmail {
  subject: string;
  html: (token?: string) => string;
  background: boolean;
}
export const emailTemplate: Record<NotificationType, IEmail> = {
  [NotificationType.VERIFICATION_EMAIL]: {
    subject: 'Verify your email',
    background: false,
    html: (tokenEmail) => `
    <h1>Verify Email</h1>

    <a href="http://localhost:3001/auth/activation/${tokenEmail}">
        Verify
    </a>
`,
  },
};
