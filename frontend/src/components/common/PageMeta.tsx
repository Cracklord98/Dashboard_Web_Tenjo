import { useEffect } from "react";

const PageMeta = ({
  title,
  description = "Dashboard Tenjo - Plan de Desarrollo Municipal",
}: {
  title: string;
  description?: string;
}) => {
  useEffect(() => {
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default PageMeta;
