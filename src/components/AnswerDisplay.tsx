import React from 'react';

interface AnswerDisplayProps {
    answer: string;
}

const AnswerDisplay = React.memo(({ answer }: AnswerDisplayProps) => {
    return (
        <div style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap' }}>
            {answer}
        </div>
    );
});

export default AnswerDisplay;
