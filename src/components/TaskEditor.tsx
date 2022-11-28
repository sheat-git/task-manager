import { AddTask, Done } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  DateTimePicker
} from '@mui/x-date-pickers';
import {
  Controller,
  SubmitHandler,
  useForm
} from 'react-hook-form';
import { supabase } from '../supabase/client';
import {
  Database
} from '../supabase/types';

interface TaskInput {
  title: string;
  content: string;
  expired_at: Date|null;
  priority: number;
  done: boolean;
}

type Props = {
  task?: Database['public']['Tables']['tasks']['Row'] | null,
  onDone: () => void
};

export default function TaskEditor({task = null, onDone}: Props) {
  const {register, handleSubmit, control} = useForm<TaskInput>({
    defaultValues: {
      title: task?.title,
      content: task?.content,
      expired_at: task?.expired_at ? new Date(task?.expired_at) : null,
      priority: task?.priority ?? 1,
      done: task?.done ?? false
    }
  });

  const onSubmit: SubmitHandler<TaskInput> = async data => {
    const userRes = await supabase.auth.getUser();
    if (userRes.error) {
      alert(userRes.error.message);
      return;
    }
    const now = new Date().toISOString();
    const {error} = await supabase.from('tasks').upsert({
      user_id: userRes.data.user.id,
      id: task?.id,
      title: data.title,
      content: data.content,
      done: data.done,
      expired_at: data.expired_at?.toISOString(),
      priority: data.priority,
      modified_at: now,
      finished_at: data.done ? task?.finished_at ?? now : null,
      created_at: task ? undefined : now
    });
    if (error) {
      alert(error.message);
      return;
    }
    onDone();
  }

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '700px',
        boxShadow: 24,
        p: 4
      }}
    >
      <Typography component='h1' variant='h5'>
        {task ? 'タスク編集' : 'タスク作成'}
      </Typography>
      <TextField
        label='タイトル'
        autoFocus
        {...register('title')}
      />
      <Controller
        control={control}
        render={({field}) => {
          return (
            <Stack direction={'row'}>
              <FormControlLabel
                control={<Checkbox size='small' checked={field.value} {...field} />}
                label='完了済'
                labelPlacement='start'
                sx={{
                  marginLeft: 0
                }}
              />
            </Stack>
          );
        }}
        {...register('done')}
      />
      <TextField
        multiline
        label='内容'
        {...register('content')}
      />
      <Controller
        control={control}
        render={({field}) => {
          return (
            <DateTimePicker
              label='期限'
              renderInput={params => <TextField {...params}/>}
              {...field}
            />
          );
        }}
        {...register('expired_at')}
      />
      <Stack spacing={1}>
        <Typography>
          優先度
        </Typography>
        <Controller
          control={control}
          render={({field}) => {
            return (
              <Slider
                step={1}
                marks
                min={1}
                max={5}
                valueLabelDisplay='auto'
                {...field}
              />
            );
          }}
          {...register('priority')}
        />
      </Stack>
      <Stack direction='row-reverse'>
        <Button
          variant='contained'
          startIcon={<AddTask/>}
          onClick={handleSubmit(onSubmit)}
        >
          登録
        </Button>
      </Stack>
    </Paper>
  );
}
