# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files và restore
COPY ["src/Api/Api.csproj", "src/Api/"]
COPY ["src/Application/Application.csproj", "src/Application/"]
COPY ["src/Infrastructure/Infrastructure.csproj", "src/Infrastructure/"]
COPY ["src/Domain/Domain.csproj", "src/Domain/"]
RUN dotnet restore "src/Api/Api.csproj"

# Copy toàn bộ source code và build
COPY . .
WORKDIR "/src/src/Api"
RUN dotnet build "Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]