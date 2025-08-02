# API Implementation Guide

## Overview

This guide documents the new unified API architecture, centralized mock data system, and implementation patterns developed to eliminate code duplication and improve maintainability.

## Architecture Overview

### Before: Scattered API Patterns
- Multiple different API service patterns (budgetApi, investmentsApi, etc.)
- Hardcoded mock data in multiple locations
- Inconsistent error handling and loading states
- Duplicated fetch logic across components

### After: Unified Architecture
- Single `ApiService` base class for all API operations
- Centralized `MockDatabase` for all mock data
- Generic `useApiData` hook for consistent state management
- Standardized error handling and retry logic

## Core Components

### 1. Base API Service (`client/services/api/base.ts`)

```typescript
class ApiService {
  private baseURL: string;
  private defaultTimeout: number = 10000;
  private maxRetries: number = 3;

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Unified request handling with retries, timeouts, and error handling
  }
}
```

**Features:**
- Automatic retry mechanism with exponential backoff
- Request timeout handling
- Unified error handling and logging
- Request cancellation support
- Development vs production environment handling

### 2. Mock Database (`client/mocks/database.ts`)

```typescript
export class MockDatabase {
  private static instance: MockDatabase;
  
  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }
  
  // Centralized mock data for all endpoints
  async getEntradas(mes: string, ano: string): Promise<MockEntrada[]>
  async getCustos(mes: string, ano: string): Promise<MockCusto[]>
  async getDividas(): Promise<MockDivida[]>
  async getMetas(): Promise<MockMeta[]>
  async getInvestments(): Promise<MockInvestment[]>
  async getCriptoData(): Promise<MockCripto[]>
}
```

**Benefits:**
- Single source of truth for all mock data
- Consistent data structure across all endpoints
- Easy to maintain and update test data
- Simulation of real API behavior with delays

### 3. Generic API Hook (`client/hooks/useApiData.ts`)

```typescript
export const useApiData = <T>(
  apiCall: () => Promise<T>,
  options: UseApiDataOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unified loading, error, and data state management
};
```

**Features:**
- Automatic loading state management
- Error handling with user-friendly messages
- Data caching and refresh capabilities
- Cleanup on component unmount

## Implementation Examples

### Converting Existing Components

#### Before (Old Pattern):
```typescript
// In component
const [entradas, setEntradas] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/entradas');
      const data = await response.json();
      setEntradas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

#### After (New Pattern):
```typescript
// In component
const { data: entradas, loading, error } = useApiData(
  () => budgetService.getEntradas(mes, ano)
);
```

### Creating New API Endpoints

1. **Add to MockDatabase:**
```typescript
// In client/mocks/database.ts
async getNewData(): Promise<NewDataType[]> {
  await this.simulateDelay();
  return this.mockNewData;
}
```

2. **Create Service Method:**
```typescript
// In client/services/api/newService.ts
class NewService extends ApiService {
  async getNewData(): Promise<NewDataType[]> {
    if (this.isDevelopment()) {
      return MockDatabase.getInstance().getNewData();
    }
    return this.request<NewDataType[]>('/api/new-data');
  }
}
```

3. **Use in Component:**
```typescript
// In component
const { data, loading, error } = useApiData(
  () => newService.getNewData()
);
```

## Chart Implementation Pattern

### Generic Chart Component Structure

To eliminate chart duplication, implement a generic chart container:

```typescript
interface ChartProps<T> {
  dataLoader: () => Promise<T>;
  chartType: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  dataTransformer: (data: T) => ChartDataFormat;
}

export const GenericChart = <T,>({ 
  dataLoader, 
  chartType, 
  title, 
  dataTransformer 
}: ChartProps<T>) => {
  const { data, loading, error } = useApiData(dataLoader);
  
  if (loading) return <ChartSkeleton />;
  if (error) return <ChartError error={error} />;
  
  const chartData = dataTransformer(data);
  
  return (
    <ChartContainer title={title}>
      {renderChart(chartType, chartData)}
    </ChartContainer>
  );
};
```

### Chart Usage Examples

```typescript
// Investment Chart
<GenericChart
  dataLoader={() => investmentService.getPortfolioData()}
  chartType="pie"
  title="Portfolio Distribution"
  dataTransformer={(data) => transformToChartFormat(data)}
/>

// Budget Chart
<GenericChart
  dataLoader={() => budgetService.getMonthlyData(mes, ano)}
  chartType="bar"
  title="Monthly Expenses"
  dataTransformer={(data) => transformToBarChart(data)}
/>
```

## Route Organization

### New Route Structure

```typescript
// client/App.tsx - Simplified routing
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/auth/*" element={<AuthRoutes />} />
    <Route path="/dashboard/*" element={<ProtectedRoutes />} />
    <Route path="/public/*" element={<PublicRoutes />} />
  </Routes>
);

// Separate route files for each section
// client/routes/ProtectedRoutes.tsx
// client/routes/AuthRoutes.tsx
// client/routes/PublicRoutes.tsx
```

### Benefits:
- Reduced App.tsx complexity (from 168 lines to ~30)
- Logical grouping of related routes
- Easier maintenance and testing
- Better code organization

## Migration Guide

### Step 1: Update Existing Services
1. Extend the new `ApiService` base class
2. Replace hardcoded mock data with `MockDatabase` calls
3. Implement proper error handling

### Step 2: Update Components
1. Replace manual state management with `useApiData` hook
2. Remove duplicated loading/error logic
3. Use standardized error messages

### Step 3: Consolidate Charts
1. Identify chart duplication patterns
2. Create generic chart components
3. Implement data transformation functions
4. Replace individual chart implementations

### Step 4: Test and Validate
1. Verify all API calls work correctly
2. Test error handling scenarios
3. Validate loading states
4. Check data consistency

## Best Practices

### API Service Guidelines
- Always extend `ApiService` for new services
- Use `MockDatabase` for development data
- Implement proper TypeScript types
- Handle errors gracefully

### Component Guidelines
- Use `useApiData` hook for API calls
- Avoid manual state management for API data
- Implement proper loading and error states
- Use generic components where possible

### Data Management
- Keep mock data in `MockDatabase`
- Use consistent data structures
- Implement proper validation
- Document data schemas

## Troubleshooting

### Common Issues

1. **Mock Data Not Loading**
   - Check `MockDatabase.getInstance()` usage
   - Verify mock data structure matches types
   - Check console for error messages

2. **API Requests Failing**
   - Verify endpoint URLs in service classes
   - Check network connectivity
   - Review error handling implementation

3. **Loading States Not Working**
   - Ensure `useApiData` hook is used correctly
   - Check component re-rendering logic
   - Verify cleanup on unmount

### Debug Tools
- Console logging in `ApiService.request()`
- Error boundaries for React components
- Network tab inspection for API calls
- MockDatabase debugging methods

## Performance Considerations

### Optimization Strategies
- Implement data caching in `useApiData`
- Use React.memo for chart components
- Lazy load chart libraries
- Optimize data transformation functions

### Memory Management
- Clean up API calls on component unmount
- Avoid memory leaks in long-running processes
- Use proper dependency arrays in useEffect

## Future Enhancements

### Planned Improvements
1. **Real-time Data Updates**
   - WebSocket integration
   - Automatic data refresh
   - Change notifications

2. **Advanced Caching**
   - Redis integration
   - Local storage caching
   - Cache invalidation strategies

3. **Enhanced Error Handling**
   - Retry strategies per endpoint
   - Offline support
   - Error recovery mechanisms

4. **Performance Monitoring**
   - API response time tracking
   - Error rate monitoring
   - Usage analytics

## Conclusion

This new architecture provides:
- **Consistency**: Unified patterns across all API interactions
- **Maintainability**: Centralized code reduces duplication
- **Scalability**: Easy to add new endpoints and features
- **Reliability**: Robust error handling and retry mechanisms
- **Developer Experience**: Clear patterns and reusable components

The implementation eliminates the major code duplication issues identified in the audit while providing a solid foundation for future development.
