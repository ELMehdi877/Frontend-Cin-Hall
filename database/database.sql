-- Active: 1768312369187@@127.0.0.1@5432@cin_hall

CREATE DATABASE cinehall;


DROP DATABASE cinehall;
-- Promote a user to admin if needed.
-- Replace the email with your real admin account.
UPDATE users
SET is_admin = true
WHERE email = 'amine@gmail.com';

SELECT * from seats;

-- Mock films for API tests
INSERT INTO films (
    id,
    title,
    description,
    genre,
    actor,
    duration_seconds,
    min_age,
    trailer_url,
    created_at,
    updated_at
) VALUES
    (
        1,
        'Interstellar',
        'A team travels through a wormhole to search for humanity''s next home.',
        'Sci-Fi',
        'Matthew McConaughey',
        10140,
        13,
        'https://example.com/trailers/interstellar',
        NOW(),
        NOW()
    ),
    (
        2,
        'The Dark Knight',
        'Batman faces the Joker in Gotham City.',
        'Action',
        'Christian Bale',
        9120,
        13,
        'https://example.com/trailers/dark-knight',
        NOW(),
        NOW()
    ),
    (
        3,
        'Spirited Away',
        'A young girl enters a world of spirits and must find her way back.',
        'Animation',
        'Rumi Hiiragi',
        7500,
        10,
        'https://example.com/trailers/spirited-away',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    genre = EXCLUDED.genre,
    actor = EXCLUDED.actor,
    duration_seconds = EXCLUDED.duration_seconds,
    min_age = EXCLUDED.min_age,
    trailer_url = EXCLUDED.trailer_url,
    updated_at = NOW();

-- Mock rooms for API tests
INSERT INTO rooms (
    id,
    name,
    type,
    capacity,
    created_at,
    updated_at
) VALUES
    (
        1,
        'Room A',
        'normal',
        40,
        NOW(),
        NOW()
    ),
    (
        2,
        'Room B',
        'VIP',
        24,
        NOW(),
        NOW()
    ),
    (
        3,
        'Room C',
        'normal',
        60,
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    capacity = EXCLUDED.capacity,
    updated_at = NOW();
