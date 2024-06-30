import { useState, useEffect } from 'react';
import Play from './icons/Play';
import Pause from './icons/Pause';

interface VoiceOverProps {
  content: string;
}

const VoiceOver = ({ content }: VoiceOverProps) => {
  const synth = window.speechSynthesis;

  const [voiceOverOn, toggleVoiceOver] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => window.speechSynthesis.getVoices());
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice>();

  useEffect(() => {
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((voice) => voice.lang.includes('en-'));

    setVoices(englishVoices);
    setSelectedVoice(englishVoices[0]);
  }, []);

  const handlePlay = () => {
    const voiceOver = new SpeechSynthesisUtterance(content);

    if (selectedVoice) voiceOver.voice = selectedVoice;

    synth.cancel();
    synth.speak(voiceOver);
  };

  const handlePause = () => {
    synth.pause();
  };

  const handleVoiceChange = (_voice: string) => {
    const selectedVoice = voices.find((voice) => voice.name === _voice);
    setSelectedVoice(selectedVoice);
  };

  return (
    <div className="flex w-full items-center justify-between gap-2 bg-sub hover:bg-sub py-2 px-2 rounded-full">
      {voiceOverOn ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              toggleVoiceOver((prev) => !prev);
              handlePause();
            }}
            className="rounded-full p-1.5 hover:bg-sub"
          >
            <Pause />
          </button>
          <p className="text-sm">Stop listening</p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              toggleVoiceOver((prev) => !prev);
              handlePlay();
            }}
            className="rounded-full p-1.5 hover:bg-gray-300"
          >
            <Play />
          </button>
          <p className="text-sm">Listen this article</p>
        </div>
      )}

      {voiceOverOn ? (
        <div className="px-2">
          <p className="text-sm px-1 rounded-md">Voice: {selectedVoice?.name}</p>
        </div>
      ) : (
        <select
          name="voices"
          id="voices"
          className="w-20 bg-inherit text-sm"
          defaultValue={selectedVoice?.name}
          value={selectedVoice?.name}
          onChange={(e) => handleVoiceChange(e.target.value)}
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default VoiceOver;
