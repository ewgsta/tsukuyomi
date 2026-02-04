import React from 'react'

export const AlbumCard = ({ album, onClick }) => {
    return (
        <div className="album-card" onClick={onClick}>
            <div className="album-cover-wrapper">
                <img
                    src={album.cover}
                    className="album-cover"
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200/121212/333333?text=Görsel+bulunamadı."
                    }}
                    alt={album.title}
                />
            </div>
            <div className="album-title">{album.title}</div>
            <div className="album-artist">{album.artist}</div>
        </div>
    )
}
