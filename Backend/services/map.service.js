const captainModel = require('../models/captain.model');

const DEFAULT_CENTER = {
    ltd: 28.6139,
    lng: 77.2090
};

function hashString(input) {
    let hash = 0;

    for (let i = 0; i < input.length; i += 1) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash);
}

function buildCoordinateFromAddress(address) {
    const hash = hashString(address.trim().toLowerCase());
    const latOffset = ((hash % 1000) / 1000) * 0.3;
    const lngOffset = (((Math.floor(hash / 1000)) % 1000) / 1000) * 0.3;

    return {
        ltd: Number((DEFAULT_CENTER.ltd + latOffset).toFixed(6)),
        lng: Number((DEFAULT_CENTER.lng + lngOffset).toFixed(6))
    };
}

function toRadians(value) {
    return (value * Math.PI) / 180;
}

function getDistanceBetweenPoints(pointA, pointB) {
    const earthRadiusInMeters = 6371000;
    const latDiff = toRadians(pointB.ltd - pointA.ltd);
    const lngDiff = toRadians(pointB.lng - pointA.lng);
    const lat1 = toRadians(pointA.ltd);
    const lat2 = toRadians(pointB.ltd);

    const haversine = (Math.sin(latDiff / 2) ** 2) +
        (Math.cos(lat1) * Math.cos(lat2) * (Math.sin(lngDiff / 2) ** 2));

    return 2 * earthRadiusInMeters * Math.asin(Math.sqrt(haversine));
}

function buildSuggestions(input) {
    const normalizedInput = input.trim();

    return [
        `${normalizedInput}, Connaught Place`,
        `${normalizedInput}, Sector 18`,
        `${normalizedInput}, MG Road`,
        `${normalizedInput}, Airport Terminal 3`,
        `${normalizedInput}, City Center`
    ];
}

module.exports.getAddressCoordinate = async (address) => {
    if (!address) {
        throw new Error('Address is required');
    }

    return buildCoordinateFromAddress(address);
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const originPoint = buildCoordinateFromAddress(origin);
    const destinationPoint = buildCoordinateFromAddress(destination);
    const distanceInMeters = Math.max(1200, Math.round(getDistanceBetweenPoints(originPoint, destinationPoint)));
    const durationInSeconds = Math.max(300, Math.round((distanceInMeters / 1000) * 180));

    return {
        distance: {
            text: `${(distanceInMeters / 1000).toFixed(1)} km`,
            value: distanceInMeters
        },
        duration: {
            text: `${Math.ceil(durationInSeconds / 60)} mins`,
            value: durationInSeconds
        },
        status: 'OK'
    };
};

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    return buildSuggestions(input);
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    try {
        const captains = await captainModel.find({
            location: {
                $geoWithin: {
                    $centerSphere: [ [ lng, ltd ], radius / 6371 ]
                }
            }
        });

        if (captains.length > 0) {
            return captains;
        }
    } catch (error) {
        console.log('Falling back to dummy captain lookup:', error.message);
    }

    return captainModel.find({
        socketId: { $ne: null }
    }).limit(10);
};