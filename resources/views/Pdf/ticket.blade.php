<style>
    :root {
        --ticket-bg: #ffffff;
        --accent: #e50914; /* Netflix Red */
        --text-main: #222;
        --text-muted: #777;
        --border-color: #ddd;
    }

    body {
        background-color: #ffffff; /* Removed the black space */
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        justify-content: center;
        padding: 40px 20px;
        margin: 0;
    }

    .ticket-container {
        width: 100%;
        max-width: 400px;
        background: var(--ticket-bg);
        border-radius: 15px;
        overflow: hidden;
        border: 1px solid var(--border-color); /* Added border */
        position: relative;
    }

    /* Cinematic Header */
    .header {
        background: var(--accent);
        color: white;
        padding: 20px;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .header h1 {
        margin: 0;
        font-size: 24px;
    }

    /* Main Film Info */
    .film-section {
        padding: 20px;
        border-bottom: 2px dashed #ddd;
        text-align: center;
    }

    .film-title {
        font-size: 22px;
        font-weight: bold;
        margin: 0 0 5px 0;
        color: var(--text-main);
    }

    .film-meta {
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 10px;
    }

    /* Grid Layout for Details */
    .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        padding: 20px;
        background: #fdfdfd;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
    }

    .label {
        font-size: 10px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 2px;
    }

    .value {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-main);
    }

    /* QR Code Section */
    .qr-section {
        padding: 20px;
        text-align: center;
        background: white;
        border-top: 1px solid #eee;
    }

    .qr-code-img {
        width: 140px;
        height: 140px;
        object-fit: contain;
    }

    .price-tag {
        font-size: 22px;
        color: var(--accent);
        font-weight: bold;
        margin-top: 5px;
    }

    .footer {
        font-size: 9px;
        color: #bbb;
        padding: 15px;
        text-align: center;
    }
</style>

<div class="ticket-container">
    <div class="header">
        <h1>Movie Ticket</h1>
    </div>

    <div class="film-section">
        <p class="film-meta">{{ $film['genre'] }} • {{ $film['duration_minutes'] }} min</p>
        <h2 class="film-title">{{ $film['title'] }}</h2>
        <p style="font-size: 11px; color: #666;">{{ $film['description'] }}</p>
    </div>

    <div class="details-grid">
        <div class="detail-item">
            <span class="label">Date & Time</span>
            <span class="value">{{ $session['start_time'] }}</span>
        </div>
        <div class="detail-item">
            <span class="label">Room</span>
            <span class="value">{{ $room['name'] }}</span>
        </div>
        <div class="detail-item">
            <span class="label">Seat</span>
            <span class="value">{{ $seat['number'] }} ({{ $seat['type'] }})</span>
        </div>
        <div class="detail-item">
            <span class="label">Status</span>
            <span class="value">{{ $reservation['status'] }}</span>
        </div>
    </div>

    <div class="qr-section">
        {{-- QR Code Logic --}}
        @if(!empty($qr_code_path))
            <img src="{{ asset('storage/' . $qr_code_path) }}" 
                 alt="QR Code" 
                 class="qr-code-img"
                 onerror="this.style.display='none';">
        @endif
        
        <div class="label" style="margin-top:10px;">Total Paid</div>
        <div class="price-tag">${{ $reservation['total_price'] }}</div>
    </div>

    <div class="footer">
        Order ID: {{ $reservation['user_id'] }}-{{ $reservation['room_session_id'] }}<br>
        Generated at {{ now() }}
    </div>
</div>