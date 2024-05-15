import React, { useEffect, useRef, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { isEmpty } from "../../utils/Utils";

export default function Slider(props) {
    const [pictures, setPictures] = useState([]);
    const lot = props.lot;

    useEffect(() => {
        var pictures = [];
        if (!isEmpty(lot.video)) pictures.push(lot.video);
        if (!isEmpty(lot.pictures[0])) {
            lot.pictures.forEach((picture) => pictures.push(picture))
        }
        setPictures(pictures);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getYoutubeId = (url) => {
        return url.split('/watch?v=').pop().split('&')[0];
    }

    const customRenderThumb = children =>
        children.map((child) => {
            const picture = child.props.src;
            return child.type === "iframe" ?
                <img key={picture} src={`https://img.youtube.com/vi/${child.props.id}/default.jpg`} alt="Lot video" />
                : <img key={picture} src={picture} alt="Lot" />
        })


    const pauseVideo = () => {
        const iframe = document.querySelector('iframe');
        if (iframe) {
            const iframeSrc = iframe.src;
            iframe.src = iframeSrc;
        }
    };

    const currentItem = () => {
        const selectedSlide = document.querySelector('.slide.selected');
        if (selectedSlide) {
            if (selectedSlide.firstChild.nodeName === 'IFRAME') {
                pauseVideo();
            }
        }
    }

    return (
        <Carousel
            // autoPlay
            interval={10000}
            infiniteLoop
            showStatus={false}
            showThumbs={true}
            renderThumbs={customRenderThumb}
            onChange={currentItem}
        >
            {!isEmpty(pictures) &&
                pictures.map((picture) => {
                    return picture.includes('http') ?
                        <iframe key={picture} title="Video lot" id={getYoutubeId(picture)} src={`https://www.youtube.com/embed/${getYoutubeId(picture)}?enablejsapi=1`}></iframe>
                        :
                        <img key={picture} src={`${process.env.REACT_APP_API_URL}${picture}`} alt="Lot" />
                })
            }
        </Carousel>
    )
}