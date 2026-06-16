export const AVAILABLE_MODELS = [
  {
    id: "higgsfield-v1",
    name: "Higgsfield V1",
    description: "Base video generation model",
    maxDuration: 5,
    creditsPerVideo: 10,
  },
  {
    id: "higgsfield-v2",
    name: "Higgsfield V2",
    description: "Enhanced quality video generation",
    maxDuration: 10,
    creditsPerVideo: 20,
  },
  {
    id: "higgsfield-cinematic",
    name: "Higgsfield Cinematic",
    description: "High-fidelity cinematic output",
    maxDuration: 15,
    creditsPerVideo: 40,
  },
];

export function getModels() {
  return AVAILABLE_MODELS;
}
