import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type TabBarVisibilityContextType = {
  visible: boolean;
  hide: () => void;
  show: () => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType>({
  visible: true,
  hide: () => {},
  show: () => {},
});

export function TabBarVisibilityProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  const hide = useCallback(() => setVisible(false), []);
  const show = useCallback(() => setVisible(true), []);

  return (
    <TabBarVisibilityContext.Provider value={{ visible, hide, show }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  return useContext(TabBarVisibilityContext);
}
