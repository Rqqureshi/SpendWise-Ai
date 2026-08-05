from sqlalchemy import create_engine, text

engine = create_engine(
    "postgresql://postgres:Rq1407@localhost:5432/spendwise_ai"
)

with engine.connect() as conn:
    result = conn.execute(text("SELECT current_database();"))
    print(result.fetchone())