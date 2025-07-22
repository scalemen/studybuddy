// API utility functions for the enhanced StudyBuddy app

export async function createNote(data: { title: string; content: string }) {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
}

export async function uploadHomework(formData: FormData) {
  const response = await fetch('/api/homeworks', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload homework');
  return response.json();
}

export async function searchTopic(query: string) {
  const response = await fetch('/api/topic-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error('Failed to search topic');
  return response.json();
}

export async function generateTopicQuiz(topic: string) {
  const response = await fetch('/api/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!response.ok) throw new Error('Failed to generate quiz');
  return response.json();
}

export async function createFlashcardDeck(data: { title: string; description: string }) {
  const response = await fetch('/api/flashcard-decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create flashcard deck');
  return response.json();
}

export async function generateFlashcards(data: { topic: string; count: number }) {
  const response = await fetch('/api/generate-flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to generate flashcards');
  return response.json();
}
