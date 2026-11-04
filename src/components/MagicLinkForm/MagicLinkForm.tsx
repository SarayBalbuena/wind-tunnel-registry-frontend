import { useState } from 'react';
import { Button, Field, Input, Text } from '@chakra-ui/react';
import { useMagicLink } from '@hooks/useMagicLink/useMagicLink';
import { useForm } from 'react-hook-form';
import { LuMail } from 'react-icons/lu';
import styles from './MagicLinkForm.module.css';

interface MagicLinkFormValues {
  email: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MagicLinkForm = () => {
  const { sendMagicLink, loading, error, reset } = useMagicLink();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkFormValues>({ defaultValues: { email: '' } });

  const onSubmit = async ({ email }: MagicLinkFormValues) => {
    if (await sendMagicLink(email)) setSentTo(email);
  };

  const handleUseAnotherEmail = () => {
    setSentTo(null);
    reset();
  };

  if (sentTo) {
    return (
      <div className={styles.sent} role="status">
        <Text fontWeight="medium">Check your inbox</Text>
        <Text fontSize="sm" color="fg.muted">
          If {sentTo} is valid, we sent a login link. It expires in 15 minutes
          and works once.
        </Text>
        <Button variant="plain" size="sm" onClick={handleUseAnotherEmail}>
          Use another email
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field.Root invalid={!!errors.email || !!error}>
        <Field.Label srOnly>Email</Field.Label>
        <div className={styles.row}>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            size="lg"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email' },
            })}
          />
          <Button type="submit" size="lg" rounded="md" loading={loading}>
            <LuMail /> Email me a link
          </Button>
        </div>
        {errors.email && (
          <Field.ErrorText>{errors.email.message}</Field.ErrorText>
        )}
        {error && !errors.email && (
          <Field.ErrorText>
            Couldn't send the link. Please try again in a few minutes.
          </Field.ErrorText>
        )}
      </Field.Root>
    </form>
  );
};
