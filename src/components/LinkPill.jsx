// LinkPill.jsx
import Microlink from '@microlink/react'; // For URL previews

const LinkPill = ({ url }) => {
    return (
        <div className=''>
            <Microlink
                url={url}
                media={['image', 'logo']}
                size='small'
            />
        </div>
    );
};

export default LinkPill;