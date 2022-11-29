supabase start
supabase status -o env --override-name api.url=REACT_APP_SUPABASE_URL --override-name auth.anon_key=REACT_APP_SUPABASE_ANON_KEY > .env
supabase functions serve deleteUser &
supabase functions serve updateUserEmail &
supabase functions serve updateUserPassword &
npm install && npm start &
