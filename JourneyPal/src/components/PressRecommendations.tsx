import React, { useRef, useState } from 'react';

const PressRecommendations: React.FC = () => {
    const recommendationContainerRef = useRef<HTMLDivElement>(null);
    const [isLeftDisabled, setIsLeftDisabled] = useState(false);
    const [isRightDisabled, setIsRightDisabled] = useState(false);

    const recommendations = [
        {
            name: 'Alex Carter @TravelPulse',
            quote: 'JourneyPal redefines travel planning with its comprehensive yet intuitive platform. It effortlessly combines itinerary building, expense tracking, and collaborative features in one sleek interface.',
        },
        {
            name: 'Sophie Martin @Wanderlust',
            quote: 'Forget spreadsheets and messy notes - JourneyPal is the all-in-one solution for modern travelers. It particularly shines in group trip coordination and real-time budget management.',
        },
        {
            name: 'James Kim @TechExplorer',
            quote: 'What sets JourneyPal apart is its ability to replace 10 different travel tools while maintaining simplicity. The map integration and AI suggestions are game-changers for frequent travelers.',
        },
        {
            name: 'Emily Davis @AdventureSeeker',
            quote: 'JourneyPal has made trip planning a breeze. Its user-friendly interface and powerful features make it a must-have for any traveler.',
        },
        {
            name: 'Michael Lee @TravelEnthusiast',
            quote: 'I’ve tried many travel apps, but JourneyPal stands out. It’s perfect for planning road trips, managing budgets, and booking flights.',
        },
    ];

    const scrollLeft = () => {
        if (recommendationContainerRef.current && !isLeftDisabled) {
            const cardWidth = recommendationContainerRef.current.children[0].clientWidth;
            const gap = 20; // Gap between cards
            recommendationContainerRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });

            // Disable the button for 1 second
            setIsLeftDisabled(true);
            setTimeout(() => {
                setIsLeftDisabled(false);
            }, 1000);
        }
    };

    const scrollRight = () => {
        if (recommendationContainerRef.current && !isRightDisabled) {
            const cardWidth = recommendationContainerRef.current.children[0].clientWidth;
            const gap = 20; // Gap between cards
            recommendationContainerRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });

            // Disable the button for 1 second
            setIsRightDisabled(true);
            setTimeout(() => {
                setIsRightDisabled(false);
            }, 1000);
        }
    };

    return (
        <section className="press-recommendations">
            <h2 className='recommended-by-experts'>Recommended by Experts</h2>
            <div className="recommendation-container" ref={recommendationContainerRef}>
                {recommendations.map((rec, index) => (
                    <div key={index} className="press-card">
                        <h3>"{rec.quote}"</h3>
                        <div className="author-info">
                            <p className="author-name">{rec.name}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="scroll-arrow left" onClick={scrollLeft} disabled={isLeftDisabled}>←</button>
            <button className="scroll-arrow right" onClick={scrollRight} disabled={isRightDisabled}>→</button>
        </section>
    );
};

export default PressRecommendations;