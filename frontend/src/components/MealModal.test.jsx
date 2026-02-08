/**
 * Tests for the MealModal component
 */
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithI18n } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import MealModal from './MealModal'
import { server } from '../test/mocks/server'
import { resetMeals } from '../test/mocks/handlers'

// Setup MSW server for search API tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => server.close())
afterEach(() => {
    server.resetHandlers()
    resetMeals()
})

describe('MealModal', () => {
    const defaultProps = {
        date: '2024-01-15',
        mealType: 'breakfast',
        meal: null,
        onClose: vi.fn(),
        onSave: vi.fn(),
        onDelete: vi.fn(),
        onCopy: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('ingredients input', () => {
        it('should render ingredients input field', () => {
            renderWithI18n(<MealModal {...defaultProps} />)

            expect(screen.getByLabelText('Ingredients')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Add ingredient...')).toBeInTheDocument()
        })

        it('should add ingredient when clicking Add button', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            const input = screen.getByPlaceholderText('Add ingredient...')
            await user.type(input, 'flour')
            await user.click(screen.getByRole('button', { name: 'Add' }))

            expect(screen.getByText('flour')).toBeInTheDocument()
            expect(input).toHaveValue('')
        })

        it('should add ingredient when pressing Enter', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            const input = screen.getByPlaceholderText('Add ingredient...')
            await user.type(input, 'eggs{Enter}')

            expect(screen.getByText('eggs')).toBeInTheDocument()
        })

        it('should add ingredient when pressing comma', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            const input = screen.getByPlaceholderText('Add ingredient...')
            await user.type(input, 'milk,')

            expect(screen.getByText('milk')).toBeInTheDocument()
        })

        it('should remove ingredient when clicking remove button', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            const input = screen.getByPlaceholderText('Add ingredient...')
            await user.type(input, 'flour{Enter}')

            expect(screen.getByText('flour')).toBeInTheDocument()

            await user.click(screen.getByRole('button', { name: 'Remove flour' }))

            expect(screen.queryByText('flour')).not.toBeInTheDocument()
        })

        it('should not add duplicate ingredients', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            const input = screen.getByPlaceholderText('Add ingredient...')
            await user.type(input, 'flour{Enter}')
            await user.type(input, 'flour{Enter}')

            const flourChips = screen.getAllByText('flour')
            expect(flourChips).toHaveLength(1)
        })

        it('should show ingredient count', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            expect(screen.getByText('0/10')).toBeInTheDocument()

            const input = screen.getByPlaceholderText('Add ingredient...')
            await user.type(input, 'flour{Enter}')

            expect(screen.getByText('1/10')).toBeInTheDocument()
        })

        it('should disable input when max ingredients reached', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            const input = screen.getByPlaceholderText('Add ingredient...')

            // Add 10 ingredients
            for (let i = 1; i <= 10; i++) {
                await user.type(input, `ingredient${i}{Enter}`)
            }

            expect(input).toBeDisabled()
            expect(screen.getByText('10/10')).toBeInTheDocument()
        })

        it('should load existing ingredients when editing', () => {
            const mealWithIngredients = {
                id: 1,
                name: 'Pancakes',
                date: '2024-01-15',
                meal_type: 'breakfast',
                ingredients: ['flour', 'eggs', 'milk']
            }

            renderWithI18n(<MealModal {...defaultProps} meal={mealWithIngredients} />)

            expect(screen.getByText('flour')).toBeInTheDocument()
            expect(screen.getByText('eggs')).toBeInTheDocument()
            expect(screen.getByText('milk')).toBeInTheDocument()
            expect(screen.getByText('3/10')).toBeInTheDocument()
        })

        it('should pass ingredients to onSave', async () => {
            const user = userEvent.setup()
            const onSave = vi.fn()
            renderWithI18n(<MealModal {...defaultProps} onSave={onSave} />)

            // Add meal name
            const nameInput = screen.getByLabelText('Meal name')
            await user.type(nameInput, 'Pancakes')

            // Add ingredients
            const ingredientInput = screen.getByPlaceholderText('Add ingredient...')
            await user.type(ingredientInput, 'flour{Enter}')
            await user.type(ingredientInput, 'eggs{Enter}')

            // Save
            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(onSave).toHaveBeenCalledWith('Pancakes', ['flour', 'eggs'], defaultProps.date, defaultProps.mealType)
        })
    })

    describe('create mode', () => {
        it('should render create mode correctly', () => {
            renderWithI18n(<MealModal {...defaultProps} />)

            expect(screen.getByText('Add Breakfast')).toBeInTheDocument()
            expect(screen.getByText('Save')).toBeInTheDocument()
        })

        it('should disable save button when name is empty', () => {
            renderWithI18n(<MealModal {...defaultProps} />)

            expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
        })

        it('should enable save button when name is provided', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            await user.type(screen.getByLabelText('Meal name'), 'Pancakes')

            expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
        })
    })

    describe('edit mode', () => {
        const existingMeal = {
            id: 1,
            name: 'Pancakes',
            date: '2024-01-15',
            meal_type: 'breakfast',
            ingredients: []
        }

        it('should render edit mode correctly', () => {
            renderWithI18n(<MealModal {...defaultProps} meal={existingMeal} />)

            expect(screen.getByText('Edit Breakfast')).toBeInTheDocument()
            expect(screen.getByDisplayValue('Pancakes')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
        })

        it('should show copy section in edit mode', () => {
            renderWithI18n(<MealModal {...defaultProps} meal={existingMeal} />)

            expect(screen.getByText(/Copy to another day/)).toBeInTheDocument()
        })
    })

    describe('ingredient search', () => {
        it('should render search section collapsed by default', () => {
            renderWithI18n(<MealModal {...defaultProps} />)

            expect(screen.getByText(/Search by ingredient/)).toBeInTheDocument()
            // Input should not be visible when collapsed
            expect(screen.queryByPlaceholderText('Enter ingredient name...')).not.toBeInTheDocument()
        })

        it('should expand search section when header is clicked', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            // Click on the search header to expand
            await user.click(screen.getByText(/Search by ingredient/))

            // Input should now be visible
            expect(screen.getByPlaceholderText('Enter ingredient name...')).toBeInTheDocument()
        })

        it('should show search results after typing', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            // Expand search section first
            await user.click(screen.getByText(/Search by ingredient/))

            const searchInput = screen.getByPlaceholderText('Enter ingredient name...')
            await user.type(searchInput, 'eggs')

            // Wait for debounced search and results
            await waitFor(() => {
                expect(screen.getByText('Pancakes')).toBeInTheDocument()
            }, { timeout: 1000 })

            // Should also show Pasta Carbonara (has eggs)
            expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument()
        })

        it('should show no results message when no matches', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            // Expand search section first
            await user.click(screen.getByText(/Search by ingredient/))

            const searchInput = screen.getByPlaceholderText('Enter ingredient name...')
            await user.type(searchInput, 'chocolate')

            await waitFor(() => {
                expect(screen.getByText('No meals found')).toBeInTheDocument()
            }, { timeout: 1000 })
        })

        it('should auto-fill form when clicking a search result', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            // Expand search section first
            await user.click(screen.getByText(/Search by ingredient/))

            const searchInput = screen.getByPlaceholderText('Enter ingredient name...')
            await user.type(searchInput, 'eggs')

            await waitFor(() => {
                expect(screen.getByText('Pancakes')).toBeInTheDocument()
            }, { timeout: 1000 })

            // Click on Pancakes result
            await user.click(screen.getByText('Pancakes'))

            // Check form is filled
            expect(screen.getByDisplayValue('Pancakes')).toBeInTheDocument()
            expect(screen.getByText('flour')).toBeInTheDocument()
            expect(screen.getByText('eggs')).toBeInTheDocument()
            expect(screen.getByText('milk')).toBeInTheDocument()
        })

        it('should clear results when search is cleared', async () => {
            const user = userEvent.setup()
            renderWithI18n(<MealModal {...defaultProps} />)

            // Expand search section first
            await user.click(screen.getByText(/Search by ingredient/))

            const searchInput = screen.getByPlaceholderText('Enter ingredient name...')
            await user.type(searchInput, 'eggs')

            await waitFor(() => {
                expect(screen.getByText('Pancakes')).toBeInTheDocument()
            }, { timeout: 1000 })

            // Clear the search
            await user.clear(searchInput)

            // Results should be hidden
            await waitFor(() => {
                expect(screen.queryByText('Pasta Carbonara')).not.toBeInTheDocument()
            })
        })
    })
})
