#%% 
import pandas as pd 

df = pd.read_csv("./homes_list.csv")
print(df.drop_duplicates())
# %%
print(df)
# %%
df.to_csv("./homes_list_dropped_duplicates.csv", index = False)
# %%
