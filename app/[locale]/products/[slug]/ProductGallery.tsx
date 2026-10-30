'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent] = useState(0)
  const count = images.length

  function show(index: number) {
    setCurrent((index + count) % count)
  }

  return (
    <>
      <div className="relative aspect-square overflow-hidden bg-beige rounded-sm group">
        {images.map((img, i) => (
          <Image
            key={img}
            src={img}
            alt={i === 0 ? name : `${name} ${i + 1}`}
            fill
            className={`object-cover transition-opacity duration-300 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ))}

        {/* Flèches précédent / suivant */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => show(current - 1)}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream/80 text-charcoal flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-cream"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => show(current + 1)}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream/80 text-charcoal flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity hover:bg-cream"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <span className="absolute bottom-3 right-3 bg-cream/80 text-charcoal text-xs px-2 py-0.5 rounded-sm">
              {current + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Miniatures cliquables */}
      {count > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => show(i)}
              aria-label={`Voir la photo ${i + 1}`}
              aria-current={i === current}
              className={`relative aspect-square overflow-hidden bg-beige rounded-sm border transition-opacity ${
                i === current ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="20vw" />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
