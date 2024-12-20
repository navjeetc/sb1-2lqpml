-- Create doctor_profiles table
create table doctor_profiles (
    user_id uuid references auth.users(id) primary key,
    specialty text not null,
    description text,
    education text,
    years_of_experience integer,
    accepting_new_patients boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table doctor_profiles enable row level security;

-- Allow read access to everyone
create policy "Doctor profiles are viewable by everyone" 
on doctor_profiles for select 
to authenticated
using (true);

-- Allow doctors to update their own profiles
create policy "Doctors can update own profile" 
on doctor_profiles for update 
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Allow system to insert doctor profiles
create policy "System can insert doctor profiles" 
on doctor_profiles for insert 
to authenticated
with check (auth.uid() = user_id);

-- Create function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_doctor_profiles_updated_at
    before update on doctor_profiles
    for each row
    execute function update_updated_at_column();
