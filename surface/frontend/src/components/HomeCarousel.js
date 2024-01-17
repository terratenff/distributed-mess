import { useState } from "react";
import { Carousel, CarouselItem, CarouselControl, CarouselIndicators, CarouselCaption } from 'reactstrap';
import img1 from "../images/img1.png";
import img2 from "../images/img2.png";
import img3 from "../images/img3.png";
import img4 from "../images/img4.png";
import img5 from "../images/img5.png";

/**
 * Creates a Carousel component for the home page of the application.
 * @returns Home Carousel.
 */
function HomeCarousel() {

    const frontItems = [
        {
            src: img1,
            altText: "Space",
            captionHeader: "Travel to space!",
            caption: "There is a galaxy ahead of us. Arrange some ships to explore it!",
            key: 1
        },
        {
            src: img2,
            altText: "Mission Control",
            captionHeader: "Send ships to space from Mission Control.",
            caption: "Mission Control lets you assign missions for ships, launch them to space, conduct repairs and, if necessary, abort missions.",
            key: 2
        },
        {
            src: img3,
            altText: "Shipyard",
            captionHeader: "Create new ships in the Shipyard.",
            caption: "Ships can be created, edited and deleted in the Shipyard.",
            key: 3
        },
        {
            src: img4,
            altText: "Drydock",
            captionHeader: "Ships are repaired in the Drydock.",
            caption: "Note that Drydock has limited capacity: only one ship can be repaired at a time.",
            key: 4
        },
        {
            src: img5,
            altText: "Launch Site",
            captionHeader: "Ships are sent to space from the Launch Site.",
            caption: "Once a ship has been instructed to launch to space from Mission Control, it is relocated here. There's only room for one, though.",
            key: 5
        }
    ];

    const [frontIndex, setFrontIndex] = useState(0);
    const [frontAnimating, setFrontAnimating] = useState(false);

    const frontNext = () => {
        if (frontAnimating) return;
        const nextIndex = frontIndex === frontItems.length - 1 ? 0 : frontIndex + 1;
        setFrontIndex(nextIndex);
    };
    
    const frontPrevious = () => {
        if (frontAnimating) return;
        const nextIndex = frontIndex === 0 ? frontItems.length - 1 : frontIndex - 1;
        setFrontIndex(nextIndex);
    };

    const frontGoToIndex = (newIndex) => {
        if (frontAnimating) return;
        setFrontIndex(newIndex);
    };

    const frontSlides = frontItems.map((item) => {
        return (
            <CarouselItem onExiting={() => setFrontAnimating(true)} on onExited={() => setFrontAnimating(false)} key={item.src}>
                <img src={item.src} alt={item.altText}/>
                <CarouselCaption captionText={item.caption} captionHeader={item.captionHeader}/>
            </CarouselItem>
        );
    });

    return (
        <Carousel activeIndex={frontIndex} next={frontNext} previous={frontPrevious} style={{ backgroundColor: "gray"}}>
            <CarouselIndicators items={frontItems} activeIndex={frontIndex} onClickHandler={frontGoToIndex}/>
            {frontSlides}
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={frontPrevious}/>
            <CarouselControl direction="next" directionText="Next" onClickHandler={frontNext}/>
        </Carousel>
    );
}

export default HomeCarousel;