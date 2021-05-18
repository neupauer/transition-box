import { useCallback, useEffect, useRef, useState } from 'react';
import { Transition } from '@headlessui/react';
import { TransitionBox } from './..';

// ==================================================
// ===== Helpers ====================================
// ==================================================

const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const useTimeout = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setTimeout(tick, delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
};

function useBoolean(initialState = false) {
  const [value, setValue] = useState(initialState);

  const on = useCallback(() => {
    setValue(true);
  }, []);

  const off = useCallback(() => {
    setValue(false);
  }, []);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  return [value, { on, off, toggle }];
}

// ==================================================
// ===== Example ====================================
// ==================================================

function Notification({ id, ...rest }) {
  const [show, { off }] = useBoolean(true);
  useTimeout(off, 5000);

  return (
    <Transition
      {...rest}
      appear
      show={show}
      className="w-full max-w-sm mb-4 overflow-hidden bg-white rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5"
      enter="transform ease-out duration-300 transition delay-200"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div>
        <div className="flex items-center p-4">
          <div className="flex justify-between flex-1 w-0">
            <p className="flex-1 w-0 text-sm font-medium text-gray-900">
              Hello {id}
            </p>
          </div>
          <div className="flex flex-shrink-0 ml-4">
            <button
              onClick={off}
              className="inline-flex text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
}

let id = 1;
const genId = () => id++;

export default function Home() {
  const [ids, setIds] = useState([0]);

  return (
    <div>
      <button onClick={() => setIds(prevIds => [genId(), ...prevIds])}>
        ADD
      </button>
      <div className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none">
        {ids.map(n => (
          <TransitionBox key={n} className="w-full max-w-sm">
            <Notification
              afterLeave={() =>
                setIds(prevIds => prevIds.filter(id => id !== n))
              }
              id={n}
            />
          </TransitionBox>
        ))}
      </div>
    </div>
  );
}
