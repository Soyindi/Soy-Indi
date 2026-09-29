import { redirect } from 'next/navigation';

export default function CardsRedirectPage() {
  redirect('/dashboard?tab=cards');
}
