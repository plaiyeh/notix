import { createClient } from '@/utils/supabase/client'

export interface Project {
  id: string
  name: string
  description: string | null
  is_public?: boolean
  author_name?: string | null
  created_at: string
}

// 1. Récupérer les projets créés par l'utilisateur connecté
export async function fetchUserProjects(): Promise<Project[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur chargement projets perso :', error)
    return []
  }
  return data || []
}

// 2. Récupérer les maquettes publiques partagées par la communauté
export async function fetchCommunityTemplates(): Promise<Project[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur chargement templates publics :', error)
    return []
  }
  return data || []
}

// 3. Créer un nouveau projet (privé ou partagé)
export async function createProject(
  name: string,
  isPublic: boolean = false,
  authorName?: string,
  description?: string
): Promise<Project | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      is_public: isPublic,
      author_name: isPublic ? (authorName || user.email?.split('@')[0] || 'Étudiant') : null,
      description: description || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur création projet :', error)
    return null
  }
  return data
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  return !error
}