import { useState } from "react";
import { Carousel, CarouselItem, CarouselControl, CarouselIndicators, CarouselCaption } from 'reactstrap';

function HomeCarousel() {

    const frontItems = [
        {
            src: "https://picsum.photos/id/1/1200/800",
            altText: "Space",
            captionHeader: "Space module is out of order.",
            caption: "Space is currently inaccessible. Stay tuned for updates on that front!",
            key: 1
        },
        {
            src: "https://picsum.photos/id/2/1200/800",
            altText: "Mission Control",
            captionHeader: "Send ships to space from Mission Control.",
            caption: "Mission Control lets you assign missions for ships, launch them to space, conduct repairs and, if necessary, abort missions.",
            key: 2
        },
        {
            src: "https://picsum.photos/id/3/1200/800",
            altText: "Shipyard",
            captionHeader: "Create new ships in the Shipyard.",
            caption: "Ships can be created, edited and deleted in the Shipyard.",
            key: 3
        },
        {
            src: "https://picsum.photos/id/4/1200/800",
            altText: "Drydock",
            captionHeader: "Ships are repaired in the Drydock.",
            caption: "Note that Drydock has limited capacity: only one ship can be repaired at a time.",
            key: 4
        },
        {
            src: "https://picsum.photos/id/5/1200/800",
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