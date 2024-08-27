import React,{ useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";


interface  AccountModalProps {
    isOpen: boolean; 
    onClose: () => void; 
};

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);

  if (!isOpen) return null;

  return (
<div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

    <div className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 className="text-lg leading-6 font-bold text-white" id="modal-title">
              Account
            </h3>
            <div className="mt-2">
              {account.status === "connected" ? (
                <div className="bg-white bg-opacity-20 rounded-lg p-4 text-white">
                  <p className="text-sm mb-2">
                    <span className="font-semibold">Status:</span> {account.status.toUpperCase()}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-semibold">Address:</span> {account.addresses?.[0]}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Chain:</span> {account.chain?.name} | {account.chainId}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-white">Not connected</p>
              )}

              {account.status === "connected" && (
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
                      className="w-full flex justify-between items-center py-2 px-4 border border-white border-opacity-50 rounded-md shadow-sm text-sm font-medium text-white bg-white bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                    >
                      Switch Chain
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {isChainDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden">
                        <div className="max-h-60 overflow-y-auto py-1">
                          {chains.map((chainOption) => (
                            <button
                              key={chainOption.id}
                              onClick={() => {
                                switchChain({ chainId: chainOption.id });
                                setIsChainDropdownOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {chainOption.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Disconnect
                  </button>
                </div>
              )}

              {account.status !== "connected" && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-white mb-2">Connect</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {connectors.map((connector) => (
                      <button
                        key={connector.uid}
                        onClick={() => connect({ connector })}
                        type="button"
                        className="px-4 py-2 bg-white text-purple-600 rounded-md hover:bg-purple-100 transition-colors duration-300"
                      >
                        {connector.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-white">
                    Status: {status.toUpperCase()}
                  </div>
                  {error && (
                    <div className="mt-2 text-sm text-red-300">
                      {error.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default AccountModal;