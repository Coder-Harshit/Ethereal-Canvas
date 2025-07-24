import Microlink from '@microlink/react';

const LinkPill = ({ url }) => {
    return (
        <div className="microlink-wrapper">
            <Microlink
                url={url}
                size='normal'
                media={['image', 'logo']}
                style={{
                    '--microlink-background-color': '#374151', // bg-gray-700
                    '--microlink-color': '#d1d5db', // text-gray-300
                    '--microlink-border-radius': '0.5rem', // rounded-lg
                    '--microlink-hover-background-color': '#4b5563', // bg-gray-600
                }}
            />
        </div>
    );
};

export default LinkPill;