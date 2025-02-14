"use client";

import { X, ChevronDown } from "lucide-react";

interface CommandsModalProps {
  url: string;
  setUrl: (url: string) => void;
  onScrape: () => void;
  isCommandsOpen: boolean;
  setIsCommandsOpen: (open: boolean) => void;
  isAdvancedOpen: boolean;
  setIsAdvancedOpen: (open: boolean) => void;
  maxExecutionTime: number;
  setMaxExecutionTime: (value: number) => void;
  filter: boolean;
  setFilter: (value: boolean) => void;
  store: boolean;
  setStore: (value: boolean) => void;
}

const CommandsModal: React.FC<CommandsModalProps> = ({
  url,
  setUrl,
  onScrape,
  isCommandsOpen,
  setIsCommandsOpen,
  isAdvancedOpen,
  setIsAdvancedOpen,
  maxExecutionTime,
  setMaxExecutionTime,
  filter,
  setFilter,
  store,
  setStore,
}) => {
  if (!isCommandsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Commands</h2>
          <button
            onClick={() => setIsCommandsOpen(false)}
            className="text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex w-full gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to get key points"
            className="w-full p-2 rounded bg-[#232323] text-white border border-gray-600"
          />
          <button
            onClick={onScrape}
            className="bg-blue-600 px-4 py-2 rounded text-white"
          >
            Scrape
          </button>
        </div>
        <div className="mt-4">
          <button
            className="flex justify-between items-center w-full p-2 bg-[#232323] text-white rounded border border-gray-600"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            Advanced Settings <ChevronDown size={16} />
          </button>
          {isAdvancedOpen && (
            <div className="mt-2 space-y-2">
              <div>
                <label className="text-sm">Max Execution Time (seconds)</label>
                <input
                  type="number"
                  value={maxExecutionTime}
                  onChange={(e) =>
                    setMaxExecutionTime(Number(e.target.value))
                  }
                  className="w-full p-2 rounded bg-[#232323] text-white border border-gray-600"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filter}
                  onChange={() => setFilter(!filter)}
                  className="w-4 h-4 cursor-pointer"
                  id="enableFiltering"
                />
                <label
                  htmlFor="enableFiltering"
                  className="text-sm cursor-pointer"
                >
                  Enable Filtering
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={store}
                  onChange={() => setStore(!store)}
                  className="w-4 h-4 cursor-pointer"
                  id="storeData"
                />
                <label htmlFor="storeData" className="text-sm cursor-pointer">
                  Store Data
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandsModal;
