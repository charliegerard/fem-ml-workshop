import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const items = [
  {
    title: "Introduction",
    links: [
      { href: "/docs", children: "Overview" },
      { href: "/docs/pre-trained-models", children: "Pre-trained models" },
      { href: "/docs/project-1", children: "Project 1" },
    ],
  },
  {
    title: "Transfer learning",
    links: [
      { href: "/docs/transfer-learning", children: "Overview" },
      { href: "/docs/project-2", children: "Project 2" },
    ],
  },
  {
    title: "Custom model",
    links: [
      { href: "/docs/custom-model", children: "Overview" },
      { href: "/docs/project-3", children: "Project 3" },
    ],
  },
  {
    title: "Bonus",
    links: [{ href: "/docs/bonus", children: "Extra content" }],
  },
];

export function SideNav() {
  const router = useRouter();

  return (
    <nav className="sidenav">
      {items.map((item) => (
        <div key={item.title}>
          <span>{item.title}</span>
          <ul className="flex column">
            {item.links.map((link) => {
              const active = router.pathname === link.href;
              return (
                <li key={link.href} className={active ? "active" : ""}>
                  <Link {...link} />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <style jsx>
        {`
          nav {
            position: sticky;
            top: var(--top-nav-height);
            height: calc(100vh - var(--top-nav-height));
            flex: 0 0 auto;
            overflow-y: auto;
            padding: 2.5rem 2rem 2rem;
            // border-right: 1px solid var(--border-color);
          }
          span {
            font-size: larger;
            padding: 0.5rem 0 0.5rem;
            font-weight: 500;
            font-size: 18px;
          }
          ul {
            padding: 0;
          }
          li {
            list-style: none;
            margin: 0;
            margin: 0px 0 12px 12px;
            font-weight: 200;
            font-size: 14px;
          }
          li :global(a) {
            text-decoration: none;
          }
          li :global(a:hover),
          li.active :global(a) {
            text-decoration: underline;
          }
        `}
      </style>
    </nav>
  );
}
