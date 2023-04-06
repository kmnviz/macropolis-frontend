const determineScreenType = (screenWidth) => {
    switch (true) {
        case screenWidth < 640:
            return 'xs';
        case screenWidth >= 640 && screenWidth < 768:
            return 'sm';
        case screenWidth >= 768 && screenWidth < 1024:
            return 'md';
        case screenWidth >= 1024 && screenWidth < 1280:
            return 'lg';
        case screenWidth >= 1280 && screenWidth < 1536:
            return 'xl';
        case screenWidth >= 1536:
            return '2xl';
    }
}

export default determineScreenType;
