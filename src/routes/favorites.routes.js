const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');
const auth = require('../middleware/auth.mw');

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique favorite ID
 *           example: "60d5ecb74b24a1234567890a"
 *         userId:
 *           type: string
 *           description: User ID who favorited the business
 *           example: "60d5ecb74b24a1234567890b"
 *         businessId:
 *           type: object
 *           description: Business details (populated)
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d5ecb74b24a1234567890c"
 *             businessName:
 *               type: string
 *               example: "Joe's Coffee Shop"
 *             logo:
 *               type: string
 *               example: "https://example.com/logo.jpg"
 *             industry:
 *               type: string
 *               example: "Food & Beverage"
 *             location:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: "123 Main St"
 *                 city:
 *                   type: string
 *                   example: "New York"
 *         folderId:
 *           type: object
 *           description: Folder details (populated)
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d5ecb74b24a1234567890d"
 *             name:
 *               type: string
 *               example: "Coffee Shops"
 *             color:
 *               type: string
 *               example: "#3B82F6"
 *             icon:
 *               type: string
 *               example: "coffee"
 *         notes:
 *           type: string
 *           description: Personal notes about the business
 *           example: "Great coffee, friendly staff"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: User-defined tags
 *           example: ["coffee", "breakfast", "wifi"]
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Personal rating
 *           example: 4.5
 *         visitCount:
 *           type: number
 *           description: Number of times visited
 *           example: 3
 *         lastVisited:
 *           type: string
 *           format: date-time
 *           description: Last visit date
 *         isPrivate:
 *           type: boolean
 *           description: Whether the favorite is private
 *           example: false
 *         metadata:
 *           type: object
 *           properties:
 *             addedFrom:
 *               type: string
 *               enum: ['search', 'explore', 'profile', 'recommendation', 'share', 'other']
 *               example: "search"
 *             deviceType:
 *               type: string
 *               enum: ['mobile', 'tablet', 'desktop', 'other']
 *               example: "mobile"
 *             reminderDate:
 *               type: string
 *               format: date-time
 *               description: Reminder date
 *             reminderNote:
 *               type: string
 *               description: Reminder note
 *               example: "Try their new seasonal menu"
 *         analytics:
 *           type: object
 *           properties:
 *             viewCount:
 *               type: number
 *               example: 15
 *             shareCount:
 *               type: number
 *               example: 2
 *             clickCount:
 *               type: number
 *               example: 8
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     FavoriteInput:
 *       type: object
 *       required:
 *         - businessId
 *       properties:
 *         businessId:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Business ID to favorite
 *           example: "60d5ecb74b24a1234567890c"
 *         folderId:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Folder ID (optional, uses default if not provided)
 *           example: "60d5ecb74b24a1234567890d"
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: Personal notes
 *           example: "Great coffee, friendly staff"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             maxLength: 50
 *           maxItems: 20
 *           description: User-defined tags
 *           example: ["coffee", "breakfast", "wifi"]
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Personal rating
 *           example: 4.5
 *         isPrivate:
 *           type: boolean
 *           description: Whether the favorite is private
 *           example: false
 *         metadata:
 *           type: object
 *           properties:
 *             addedFrom:
 *               type: string
 *               enum: ['search', 'explore', 'profile', 'recommendation', 'share', 'other']
 *               example: "search"
 *             location:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                   minimum: -90
 *                   maximum: 90
 *                 longitude:
 *                   type: number
 *                   minimum: -180
 *                   maximum: 180
 *                 address:
 *                   type: string
 *                   maxLength: 200
 *             reminderDate:
 *               type: string
 *               format: date-time
 *             reminderNote:
 *               type: string
 *               maxLength: 200
 */

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add business to favorites (KON-35)
 *     description: Add a business to user's favorites with optional folder organization
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoriteInput'
 *     responses:
 *       201:
 *         description: Business added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Business added to favorites successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     favorite:
 *                       $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Business or folder not found
 *       409:
 *         description: Business already in favorites
 */
router.post('/', auth.authenticate, favoritesController.addFavorite);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get user's favorites with filtering and search (KON-36)
 *     description: Retrieve user's favorite businesses with comprehensive filtering and search options
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by folder ID
 *         example: "60d5ecb74b24a1234567890d"
 *       - in: query
 *         name: tags
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         style: form
 *         explode: true
 *         description: Filter by tags
 *         example: ["coffee", "breakfast"]
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *         example: 4.0
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ['created', 'updated', 'name', 'rating', 'visits', 'lastVisited']
 *           default: 'created'
 *         description: Sort criteria
 *         example: "rating"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: ['asc', 'desc']
 *           default: 'desc'
 *         description: Sort order
 *         example: "desc"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of results per page
 *         example: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Text search in notes and tags
 *         example: "coffee shop"
 *       - in: query
 *         name: isPrivate
 *         schema:
 *           type: boolean
 *         description: Filter by privacy status
 *         example: false
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     favorites:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Favorite'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                           example: 1
 *                         totalPages:
 *                           type: number
 *                           example: 3
 *                         totalFavorites:
 *                           type: number
 *                           example: 45
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                         limit:
 *                           type: number
 *                           example: 20
 *                     appliedFilters:
 *                       type: object
 *                       properties:
 *                         folderId:
 *                           type: string
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                         rating:
 *                           type: number
 *                         search:
 *                           type: string
 *                         isPrivate:
 *                           type: boolean
 *                     sortedBy:
 *                       type: string
 *                       example: "rating_desc"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth.authenticate, favoritesController.getFavorites);

/**
 * @swagger
 * /api/favorites/{favoriteId}:
 *   get:
 *     summary: Get single favorite details
 *     description: Retrieve detailed information about a specific favorite
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Favorite ID
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Favorite details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     favorite:
 *                       $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
router.get('/:favoriteId', auth.authenticate, favoritesController.getFavorite);

/**
 * @swagger
 * /api/favorites/{favoriteId}:
 *   put:
 *     summary: Update favorite
 *     description: Update favorite details including folder, notes, tags, and rating
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Favorite ID
 *         example: "60d5ecb74b24a1234567890a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               folderId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: Move to different folder
 *                 example: "60d5ecb74b24a1234567890d"
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Update notes
 *                 example: "Updated notes about this place"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 50
 *                 maxItems: 20
 *                 description: Update tags
 *                 example: ["coffee", "breakfast", "wifi", "outdoor"]
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Update rating
 *                 example: 4.5
 *               isPrivate:
 *                 type: boolean
 *                 description: Update privacy status
 *                 example: false
 *               metadata:
 *                 type: object
 *                 properties:
 *                   reminderDate:
 *                     type: string
 *                     format: date-time
 *                   reminderNote:
 *                     type: string
 *                     maxLength: 200
 *     responses:
 *       200:
 *         description: Favorite updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Favorite updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     favorite:
 *                       $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite or target folder not found
 */
router.put('/:favoriteId', auth.authenticate, favoritesController.updateFavorite);

/**
 * @swagger
 * /api/favorites/{favoriteId}:
 *   delete:
 *     summary: Remove favorite
 *     description: Remove a business from user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Favorite ID
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Favorite removed successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
router.delete('/:favoriteId', auth.authenticate, favoritesController.removeFavorite);

/**
 * @swagger
 * /api/favorites/check/{businessId}:
 *   get:
 *     summary: Check if business is favorited
 *     description: Check if a specific business is in user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Business ID
 *         example: "60d5ecb74b24a1234567890c"
 *     responses:
 *       200:
 *         description: Favorite status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     isFavorited:
 *                       type: boolean
 *                       example: true
 *                     favorite:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/Favorite'
 *                         - type: null
 *       401:
 *         description: Unauthorized
 */
router.get('/check/:businessId', auth.authenticate, favoritesController.checkFavoriteStatus);

/**
 * @swagger
 * /api/favorites/tags/popular:
 *   get:
 *     summary: Get popular tags
 *     description: Get user's most frequently used tags
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Maximum number of tags to return
 *         example: 20
 *     responses:
 *       200:
 *         description: Popular tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: string
 *                             example: "coffee"
 *                           count:
 *                             type: number
 *                             example: 15
 *                           lastUsed:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/tags/popular', auth.authenticate, favoritesController.getPopularTags);

/**
 * @swagger
 * /api/favorites/bulk:
 *   post:
 *     summary: Bulk operations on favorites
 *     description: Perform bulk operations like move, delete, tag, or untag on multiple favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - favoriteIds
 *               - operation
 *             properties:
 *               favoriteIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   pattern: '^[0-9a-fA-F]{24}$'
 *                 minItems: 1
 *                 maxItems: 50
 *                 description: Array of favorite IDs
 *                 example: ["60d5ecb74b24a1234567890a", "60d5ecb74b24a1234567890b"]
 *               operation:
 *                 type: string
 *                 enum: ['move', 'delete', 'tag', 'untag']
 *                 description: Operation to perform
 *                 example: "move"
 *               targetFolderId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: Target folder ID (required for move operation)
 *                 example: "60d5ecb74b24a1234567890d"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 50
 *                 minItems: 1
 *                 description: Tags to add or remove (required for tag/untag operations)
 *                 example: ["wifi", "outdoor"]
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bulk move completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount:
 *                       type: number
 *                       example: 5
 *                     operation:
 *                       type: string
 *                       example: "move"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Some favorites or target folder not found
 */
router.post('/bulk', auth.authenticate, favoritesController.bulkOperation);

/**
 * @swagger
 * /api/favorites/analytics:
 *   get:
 *     summary: Get favorites analytics
 *     description: Get analytics and statistics about user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: ['day', 'week', 'month', 'year', 'all']
 *           default: 'month'
 *         description: Time period for analytics
 *         example: "month"
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter analytics by folder
 *         example: "60d5ecb74b24a1234567890d"
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: ['day', 'week', 'month', 'folder', 'tag']
 *           default: 'day'
 *         description: Group analytics by
 *         example: "folder"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Limit number of results
 *         example: 10
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     analytics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "2024-01-15"
 *                           count:
 *                             type: number
 *                             example: 5
 *                           totalViews:
 *                             type: number
 *                             example: 25
 *                           totalShares:
 *                             type: number
 *                             example: 3
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalFavorites:
 *                           type: number
 *                           example: 45
 *                         totalViews:
 *                           type: number
 *                           example: 320
 *                         totalShares:
 *                           type: number
 *                           example: 15
 *                         avgRating:
 *                           type: number
 *                           example: 4.2
 *                         mostRecentAdd:
 *                           type: string
 *                           format: date-time
 *                     timeframe:
 *                       type: string
 *                       example: "month"
 *                     groupBy:
 *                       type: string
 *                       example: "day"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics', auth.authenticate, favoritesController.getAnalytics);

/**
 * @swagger
 * /api/favorites/reminders:
 *   post:
 *     summary: Set reminder for favorite
 *     description: Set a reminder for a specific favorite business
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - favoriteId
 *               - reminderDate
 *             properties:
 *               favoriteId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: Favorite ID
 *                 example: "60d5ecb74b24a1234567890a"
 *               reminderDate:
 *                 type: string
 *                 format: date-time
 *                 description: Reminder date (must be in the future)
 *                 example: "2024-02-15T10:00:00Z"
 *               reminderNote:
 *                 type: string
 *                 maxLength: 200
 *                 description: Optional reminder note
 *                 example: "Try their new seasonal menu"
 *     responses:
 *       200:
 *         description: Reminder set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reminder set successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     reminderDate:
 *                       type: string
 *                       format: date-time
 *                     reminderNote:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
router.post('/reminders', auth.authenticate, favoritesController.setReminder);

/**
 * @swagger
 * /api/favorites/reminders/upcoming:
 *   get:
 *     summary: Get upcoming reminders
 *     description: Get user's upcoming favorite reminders
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 365
 *           default: 7
 *         description: Number of days to look ahead
 *         example: 7
 *     responses:
 *       200:
 *         description: Upcoming reminders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     reminders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d5ecb74b24a1234567890a"
 *                           businessId:
 *                             type: object
 *                             properties:
 *                               businessName:
 *                                 type: string
 *                                 example: "Joe's Coffee Shop"
 *                               logo:
 *                                 type: string
 *                                 example: "https://example.com/logo.jpg"
 *                               location:
 *                                 type: object
 *                               contactInfo:
 *                                 type: object
 *                           metadata:
 *                             type: object
 *                             properties:
 *                               reminderDate:
 *                                 type: string
 *                                 format: date-time
 *                               reminderNote:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/reminders/upcoming', auth.authenticate, favoritesController.getUpcomingReminders);

module.exports = router; 