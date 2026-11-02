import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import Image from "next/image";
import { imageUrl } from "@/lib/sanity";
import type { SanityImageSource } from "@sanity/image-url";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="mt-10 mb-3 text-2xl">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 mb-2 text-xl">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-s-4 border-accent ps-4 text-muted italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="my-4 leading-7">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="my-4 list-disc ps-6">{children}</ul>,
    number: ({ children }) => <ol className="my-4 list-decimal ps-6">{children}</ol>,
  },
  marks: {
    code: ({ children }) => (
      <code className="bg-surface border-(length:--border-width) border-border px-1.5 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={String(value?.href ?? "#")}
        rel="noopener noreferrer nofollow"
        className="text-accent underline"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <Image
        src={imageUrl(value as SanityImageSource, 1200)}
        alt={String((value as { alt?: string }).alt ?? "")}
        width={1200}
        height={675}
        className="my-6 h-auto w-full rounded-(--radius)"
      />
    ),
  },
};

export const PostBody = ({ value }: { value: readonly PortableTextBlock[] }) => (
  <div className="text-base">
    <PortableText value={[...value]} components={components} />
  </div>
);
