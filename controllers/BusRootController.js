const BusRootModel = require("../models/BusRootModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const busModel = require("../models/BusModel");


const addBusRoot = async (req, res) => {
    const { root_number, index, start_place, end_place, distance, travel_time, start_time } = req.body;

    try {
        if (!root_number || !distance || !travel_time || (index === undefined && !start_place) || index < 0) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Invalid input' });
        }

        const bus_id = req.busId._id;

        // Check if the bus already has a root ID
        const bus = await busModel.findById(bus_id);
        if (bus.busRootId) {
            const existingBusRoot = await BusRootModel.findById(bus.busRootId);

            // If the bus already has a root, check if it's the same root number
            if (existingBusRoot.root_number !== root_number) {
                return res.status(400).json({ response_code: 400, success: false, message: 'Bus already has a different root assigned' });
            }
        }

        let busRoot = await BusRootModel.findOne({ root_number, busId: bus_id });

        if (!busRoot) {
            if (index !== 0) {
                return res.status(400).json({ response_code: 400, success: false, message: 'Invalid index for the first segment' });
            }
            if (!start_place) {
                return res.status(400).json({ response_code: 400, success: false, message: 'Start place is required for the first segment' });
            }
            busRoot = new BusRootModel({
                root_number,
                busId: bus_id,
                start_time,
                segments: [{ start_place, end_place, distance, travel_time }]
            });
        } else {
            const existingSegment = busRoot.segments.find(segment => segment.index === index);

            if (existingSegment) {
                return res.status(400).json({ response_code: 400, success: false, message: 'Segment with this index already exists' });
            }
            if (index > busRoot.segments.length) {
                return res.status(400).json({ response_code: 400, success: false, message: 'Index out of bounds' });
            }

            if (index < busRoot.segments.length) {
                busRoot.segments[index].start_place = start_place || busRoot.segments[index].start_place;
                busRoot.segments[index].end_place = end_place || busRoot.segments[index].end_place;
                busRoot.segments[index].distance = distance;
                busRoot.segments[index].travel_time = travel_time;
            } else {
                if (busRoot.segments.length > 0 && !busRoot.segments[busRoot.segments.length - 1].end_place) {
                    return res.status(400).json({ response_code: 400, success: false, message: 'Previous segment end place is required' });
                }
                const newStartPlace = start_place || busRoot.segments[busRoot.segments.length - 1].end_place;
                if (!newStartPlace) {
                    return res.status(400).json({ response_code: 400, success: false, message: 'Start place is required for the new segment' });
                }
                busRoot.segments.push({ start_place: newStartPlace, end_place, distance, travel_time, start_time });
            }
        }

        await busRoot.save();

        // Update the bus model with the busRootId and set hasbusRoot to true
        await busModel.updateOne(
            { _id: bus_id },
            { busRootId: busRoot._id, hasbusRoot: true }
        );

        res.status(200).json({ response_code: 200, success: true, message: 'Segment added/updated successfully', busRoot });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, message: error.message });
    }
};




const getBusRootById = async (req, res) => {
    const { id } = req.params;
    try {
        const busroot = await BusRootModel.findById(id);
        if (!busroot) {
            throw Error("Bus root not found");
        }
        res.status(200).json({ response_code: 200, success: true, busroot });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};

const getBusRootBybusId = async (req, res) => {
    const busId = req.busId._id;

    try {
        const busRoot = await BusRootModel.findOne({ busId });

        if (!busRoot) {
            throw new Error("Bus root not found");
        }
        // Extract the first start place and the last end place
        const segments = busRoot.segments;
        const firstStartPlace = segments.length > 0 ? segments[0].start_place : null;
        const lastEndPlace = segments.length > 0 ? segments[segments.length - 1].end_place : null;

        res.status(200).json({
            response_code: 200,
            success: true,
            busRoot,
            first_start_place: firstStartPlace,
            last_end_place: lastEndPlace
        });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
}

const getAllBusRootPagination = async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    try {
        const query = {
            $or: [
                { root_number: { $regex: search, $options: "i" } },
                { "segments.start_place": { $regex: search, $options: "i" } },
                { "segments.end_place": { $regex: search, $options: "i" } },
            ],
        };

        const busRoots = await BusRootModel.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await BusRootModel.countDocuments(query);

        // Add segment index and first start_place and last end_place to each bus root
        const busRootsWithDetails = busRoots.map(busRoot => {
            const busRootObject = busRoot.toObject();
            const segmentsWithIndex = busRootObject.segments.map((segment, index) => ({
                ...segment,
                index,
            }));

            // Get first start_place and last end_place
            const firstStartPlace = segmentsWithIndex.length > 0 ? segmentsWithIndex[0].start_place : null;
            const lastEndPlace = segmentsWithIndex.length > 0 ? segmentsWithIndex[segmentsWithIndex.length - 1].end_place : null;

            return {
                ...busRootObject,
                segments: segmentsWithIndex,
                first_start_place: firstStartPlace,
                last_end_place: lastEndPlace,
            };
        });

        res.status(200).json({
            response_code: 200,
            success: true,
            busRoots: busRootsWithDetails,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};




const updateBusRoot = async (req, res) => {
    const { root_number, index, start_place, end_place, distance, travel_time, start_time } = req.body;

    try {
        if (!root_number || index === undefined || index < 0 || !distance || !travel_time) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Invalid input' });
        }

        // When index is 0, start_place is required
        if (index === 0 && !start_place) {
            return res.status(400).json({ response_code: 400, success: false, message: 'Start place is required for the first segment' });
        }

        const bus_id = req.busId._id;
        const busRoot = await BusRootModel.findOne({ root_number, busId: bus_id });

        if (!busRoot) {
            return res.status(404).json({ response_code: 404, success: false, message: 'Bus root not found' });
        }

        // Update bus root's start time if provided
        if (start_time) {
            busRoot.start_time = start_time;
        }

        const existingSegment = busRoot.segments.find(segment => segment.index === index);

        if (existingSegment) {
            // Update existing segment
            existingSegment.start_place = start_place || existingSegment.start_place;
            existingSegment.end_place = end_place || existingSegment.end_place;
            existingSegment.distance = distance;
            existingSegment.travel_time = travel_time;
        } else {
            if (index > busRoot.segments.length) {
                return res.status(400).json({ response_code: 400, success: false, message: 'Index out of bounds' });
            }

            if (index < busRoot.segments.length) {
                busRoot.segments[index] = { start_place, end_place, distance, travel_time };
            } else {
                const newStartPlace = start_place || (busRoot.segments.length > 0 && busRoot.segments[busRoot.segments.length - 1].end_place);
                if (!newStartPlace) {
                    return res.status(400).json({ response_code: 400, success: false, message: 'Start place is required for the new segment' });
                }
                busRoot.segments.push({ start_place: newStartPlace, end_place, distance, travel_time });
            }
        }

        await busRoot.save();

        res.status(200).json({ response_code: 200, success: true, message: 'Segment updated successfully', busRoot });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, message: error.message });
    }
};


const deleteBusRoot = async (req, res) => {
    const { id } = req.params;
    try {
        const busroot = await BusRootModel.findByIdAndDelete(id);

        if (!busroot) {
            throw Error("Bus root not found");
        }

        res.status(200).json({ response_code: 200, success: true, message: "Bus deleted successfully" });
    } catch (error) {
        res.status(400).json({ response_code: 400, success: false, error: error.message });
    }
};
module.exports = {
    addBusRoot,
    getBusRootById,
    getAllBusRootPagination,
    updateBusRoot,
    deleteBusRoot,
    getBusRootBybusId
}
