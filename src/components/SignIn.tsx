import { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { supabase } from '../supabase/client';

interface SignFormInput {
  account: string;
  password: string;
}

type Props = {
  useEmail: boolean,
  setUseEmail: (useEmail: boolean) => void
};

export default function SignIn(
  {useEmail, setUseEmail}: Props
) {
  const [isSignIn, setIsSignIn] = useState(true);
  const {register, handleSubmit} = useForm<SignFormInput>();

  const handleChangeUseEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setUseEmail(event.target.checked);
  };

  const onSubmit: SubmitHandler<SignFormInput> = async data => {
    const email = useEmail ? data.account : data.account + '@task-manager.sheat-git.github.io';
    const credentials = {email: email, password: data.password};
    const {error} = await (isSignIn ? supabase.auth.signInWithPassword(credentials) : supabase.auth.signUp(credentials));
    if (error) {
      alert(error.message);
    }
  };

  return (
    <Container component='main' maxWidth='xs'>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component='h1' variant='h5'>
          {isSignIn ? 'サインイン' : 'サインアップ'}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            margin='normal'
            required
            fullWidth
            label={useEmail ? 'メールアドレス' : 'アカウント名'}
            autoComplete={useEmail ? 'email' : ''}
            autoFocus
            {...register('account')}
          />
          <FormControlLabel
            control={<Checkbox onChange={handleChangeUseEmail} checked={useEmail} />}
            label='メールアドレスを使用する'
          />
          <TextField
            margin='normal'
            required
            fullWidth
            label='パスワード'
            type='password'
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
            {...register('password')}
          />
          <Button
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSubmit(onSubmit)}
          >
            {isSignIn ? 'サインイン' : 'サインアップ'}
          </Button>
          <Grid container justifyContent='flex-end'>
            <Grid item>
              <Button
                type='button'
                variant='text'
                size='small'
                onClick={() => setIsSignIn(!isSignIn)}
              >
                {isSignIn ? 'サインアップ' : 'サインイン'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
