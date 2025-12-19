import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import imgPlaneacion from "../assets/brand/planeacion.jpg";
import imgQuantika from "../assets/brand/quantika.jpeg";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [
      { name: "Resumen General", path: "/", pro: false },
      { name: "Ejecución Presupuestal", path: "/ejecucion-presupuestal", pro: false },
      { name: "Ejecución Física", path: "/ejecucion-fisica", pro: false },
      { name: "Secretarías", path: "/secretarias", pro: false },
      { name: "Metas de Producto", path: "/metas-producto", pro: false }
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendario",
    path: "/calendar",
  },
  // {
  //   icon: <UserCircleIcon />,
  //   name: "User Profile",
  //   path: "/profile",
  // },
  {
    name: "Páginas",
    icon: <PageIcon />,
    subItems: [
      { name: "Página en Blanco", path: "/blank", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  // Comentado: No se usa autenticación por ahora
  // {
  //   icon: <PlugInIcon />,
  //   name: "Authentication",
  //   subItems: [
  //     { name: "Sign In", path: "/signin", pro: false },
  //     { name: "Sign Up", path: "/signup", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-72.5"
            : isHovered
            ? "w-72.5"
            : "w-22.5"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2 px-2">
              <div className="w-10 h-10 bg-linear-to-br from-[#003D7A] to-[#1B7D3F] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                  TENJO
                </span>
                <span className="text-[10px] font-bold text-[#1B7D3F] dark:text-green-400 tracking-[0.2em] uppercase leading-none mt-1">
                  Dashboard
                </span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-linear-to-br from-[#003D7A] to-[#1B7D3F] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-xl">T</span>
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-5 text-[10px] font-extrabold uppercase tracking-[0.2em] flex leading-5 text-gray-400 dark:text-gray-500 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start px-4"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-4 bg-linear-to-b from-[#003D7A] to-[#1B7D3F] rounded-full shadow-sm"></div>
                    <span>Navegación</span>
                  </div>
                ) : (
                  <HorizontaLDots className="size-6 opacity-50" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {othersItems.length > 0 && (
              <div className="mt-8">
                <h2
                  className={`mb-5 text-[10px] font-extrabold uppercase tracking-[0.2em] flex leading-5 text-gray-400 dark:text-gray-500 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start px-4"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-4 bg-gray-300 dark:bg-gray-700 rounded-full shadow-sm"></div>
                      <span>Otros</span>
                    </div>
                  ) : (
                    <HorizontaLDots className="opacity-50" />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="mt-auto pb-6 flex flex-col gap-6 items-center">
            <div className="px-4">
              <img 
                src={imgPlaneacion} 
                alt="Planeación" 
                className="w-full rounded-xl shadow-md border border-gray-100 dark:border-gray-800"
              />
            </div>
            <div className="px-10">
              <img 
                src={imgQuantika} 
                alt="Quantika" 
                className="w-full opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            
            {/* Footer de la Barra Lateral */}
            <div className="px-6 pb-4 text-center">
              <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-4"></div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Diseñado y desarrollado con <span className="text-red-500 animate-pulse">❤️</span> por <br />
                <span className="font-bold text-gray-700 dark:text-gray-200">Quantika IA SAS</span>
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-wider">
                Secretaría de Planeación y Desarrollo Territorial <br />
                Tenjo, Cundinamarca © 2025
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
