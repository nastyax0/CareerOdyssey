"use client"; 
import { supabase } from "../lib/supabase"; 

export async function signUp(email, password) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return user;
}

export async function signIn(email, password) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
}
