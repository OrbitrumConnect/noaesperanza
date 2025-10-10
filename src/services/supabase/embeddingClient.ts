// 🌀 EMBEDDING CLIENT - BUSCA VETORIAL
// Cliente para busca de similaridade semântica usando embeddings

export async function getVectorMatch(query: string) {
  const response = await fetch("/api/embedding/search", {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return await response.json();
}
